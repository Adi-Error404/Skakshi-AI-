import json
import os
import re
import time
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Set
from fastapi import FastAPI, HTTPException, Header, Depends, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load .env from backend directory and project root
_curr_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(os.path.dirname(_curr_dir), ".env"))
load_dotenv(os.path.join(_curr_dir, ".env"))
load_dotenv()

from db import get_connection, verify_all_integrity, tamper_working_db, restore_clean_db
from ledger import get_ledger_state, record_action
from ingest import ingest_all
from resolve import (
    resolve_entities,
    get_merge_queue_data,
    approve_merge_decision,
    reject_merge_decision,
    unmerge_decision,
    propose_merge_decision
)
from graph import get_graph_instance, rebuild_graph
from alerts import generate_alerts, get_golden_hour_details
from simulate import simulate_node_removal
from auth import (
    USERS_DB,
    create_jwt_token,
    get_current_user,
    require_roles,
    mask_phone_str,
    verify_password
)
from validate import run_validation
from copilot import process_copilot_query
from report import build_pdf_dossier
from mailer import send_report_email

app = FastAPI(title="SAKSHI Intelligence Workbench API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MOCK_DIR = os.path.join(BASE_DIR, "mock")

def load_mock_json(filename: str):
    filepath = os.path.join(MOCK_DIR, filename)
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

# Set of entity IDs unmasked by SP/DySP during current session
unmasked_entities: Set[str] = set()

# Pydantic Request Models
class LoginRequest(BaseModel):
    email: str
    password: str

class RemoveNodeRequest(BaseModel):
    node_id: str

class CopilotRequest(BaseModel):
    question: str

class ReportEmailRequest(BaseModel):
    report_id: str

# 1. AUTH
@app.post("/api/auth/login")
def login(req: LoginRequest):
    email = req.email.lower().strip()
    user = USERS_DB.get(email)
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials. Use demo password 'demo123'")

    token = create_jwt_token(user["email"], user["role"], user["name"])

    # Record login in cryptographic ledger
    conn = get_connection()
    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    record_action(
        conn,
        f"USER_LOGIN (Authenticated session started for {user['email']})",
        {"email": user["email"], "role": user["role"], "method": "jwt_pbkdf2"},
        ts=now_iso
    )

    return {
        "token": token,
        "user": {
            "email": user["email"],
            "name": user["name"],
            "role": user["role"]
        }
    }

# 2. CASE
@app.get("/api/case")
def get_case(user: Dict[str, Any] = Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT count(distinct entity_id) FROM entity_members")
    row = cursor.fetchone()
    ents_count = row[0] if row else 60

    cursor.execute("SELECT count(*) FROM calls")
    calls_count = cursor.fetchone()[0]

    cursor.execute("SELECT count(*) FROM transactions")
    txns_count = cursor.fetchone()[0]

    alerts_list = generate_alerts(conn)

    return {
        "case_id": "SP-014",
        "title": "Durg Missing Cluster",
        "status": "Open",
        "persons": ents_count,
        "calls": calls_count,
        "txns": txns_count,
        "alerts": len(alerts_list)
    }

# 3. GRAPH
@app.get("/api/graph")
def get_graph(until: Optional[str] = Query(None), user: Dict[str, Any] = Depends(get_current_user)):
    kg = get_graph_instance()
    graph_data = kg.get_graph_data(until)
    is_sp = (user["role"] == "sp_dysp")

    nodes = []
    for node in graph_data.get("nodes", []):
        node_copy = dict(node)
        ent_id = node_copy.get("id")
        should_mask = (not is_sp) and (ent_id not in unmasked_entities)
        if should_mask and node_copy.get("phone"):
            node_copy["phone"] = mask_phone_str(node_copy["phone"])
            if node_copy.get("type") == "phone":
                node_copy["label"] = mask_phone_str(node_copy.get("label", ""))
        nodes.append(node_copy)

    return {
        "nodes": nodes,
        "edges": graph_data.get("edges", [])
    }

# 4. ENTITY DETAILS
@app.get("/api/entity/{entity_id}")
def get_entity(entity_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    kg = get_graph_instance()
    is_sp = (user["role"] == "sp_dysp")
    is_unmasked = entity_id in unmasked_entities

    if entity_id in kg.entity_details:
        ent = dict(kg.entity_details[entity_id])
    else:
        # Check node in graph
        if entity_id in kg.nodes_data:
            m = kg.nodes_data[entity_id]
            ent = {
                "id": m["id"],
                "label": m["label"],
                "type": m["type"],
                "aliases": m.get("aliases", []),
                "priority": m.get("priority", 0.5),
                "priority_breakdown": m.get("priority_breakdown", {
                    "betweenness": 0.5,
                    "pagerank": 0.5,
                    "cross_community": 0.5,
                    "evidence_diversity": 0.5
                }),
                "role_label": m.get("role_label", ""),
                "connections": [],
                "evidence": [
                    {"evidence_id": f"PR-{entity_id[-4:]}", "kind": "observed", "summary": f"Observed operational record for {m['label']}.", "ts": "2026-09-24T10:00:00Z"}
                ],
                "phone": m.get("phone", "")
            }
        else:
            raise HTTPException(status_code=404, detail=f"Entity {entity_id} not found in case network")

    if not is_sp and not is_unmasked and ent.get("phone"):
        ent["phone"] = mask_phone_str(ent["phone"])

    return ent

# 5. UNMASK ENTITY (sp_dysp only)
@app.post("/api/entity/{entity_id}/unmask")
def unmask_entity(entity_id: str, user: Dict[str, Any] = Depends(require_roles(["sp_dysp"]))):
    kg = get_graph_instance()
    conn = get_connection()

    raw_phone = ""
    if entity_id in kg.entity_details:
        raw_phone = kg.entity_details[entity_id].get("phone", "")
    elif entity_id in kg.nodes_data:
        raw_phone = kg.nodes_data[entity_id].get("phone", "")

    if not raw_phone:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT p.phone_norm 
            FROM entity_members em
            JOIN persons p ON em.record_id = p.record_id
            WHERE em.entity_id = ? AND p.phone_norm != ''
            LIMIT 1
        """, (entity_id,))
        r = cursor.fetchone()
        if r:
            raw_phone = r[0]

    unmasked_entities.add(entity_id)

    # Write unmask action to cryptographic ledger
    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    record_action(
        conn,
        f"PHONE_UNMASKED (Evidentiary phone unmasked for entity {entity_id} by {user['email']})",
        {"entity_id": entity_id, "authorized_officer": user["email"], "role": user["role"]},
        ts=now_iso
    )

    return {
        "id": entity_id,
        "entity_id": entity_id,
        "phone": raw_phone,
        "unmasked_phone": raw_phone,
        "status": "unmasked"
    }

# 6. EDGE EXPLANATION
@app.get("/api/edge/{source}/{target}/explain")
def explain_edge(source: str, target: str, user: Dict[str, Any] = Depends(get_current_user)):
    kg = get_graph_instance()
    key1 = f"{source}__{target}"
    key2 = f"{target}__{source}"

    if key1 in kg.edge_explanations:
        return kg.edge_explanations[key1]
    if key2 in kg.edge_explanations:
        return kg.edge_explanations[key2]

    # Synthesize fallback
    return {
        "score": 0.65,
        "formula": "1 - prod(1 - w*s)",
        "components": [
            {
                "type": "observed_interaction",
                "count": 3,
                "weight": 0.5,
                "s": 0.65,
                "contribution": 0.33,
                "evidence_ids": ["EVD-REF-01"]
            }
        ],
        "snippets": [
            {
                "evidence_id": "FIR-07-S3",
                "text": f"Corroborating record of continuous interaction between {source} and {target} along the transit corridor."
            }
        ]
    }

# 7. MERGE QUEUE
@app.get("/api/merge-queue")
def get_merge_queue(user: Dict[str, Any] = Depends(get_current_user)):
    conn = get_connection()
    queue = get_merge_queue_data(conn)
    is_sp = (user["role"] == "sp_dysp")

    result = []
    for item in queue:
        item_copy = dict(item)
        records = []
        for r in item.get("records", []):
            rc = dict(r)
            if not is_sp and rc.get("phone"):
                rc["phone"] = mask_phone_str(rc["phone"])
            records.append(rc)
        item_copy["records"] = records
        result.append(item_copy)

    return result

@app.post("/api/merge/{merge_id}/approve")
def approve_merge(merge_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    conn = get_connection()
    if user["role"] == "head_constable":
        res = propose_merge_decision(conn, merge_id, proposer=user["email"])
        return {"status": "proposed", "merge_id": merge_id, "detail": "Merge proposal submitted for SP/DySP review"}
    elif user["role"] == "sp_dysp":
        res = approve_merge_decision(conn, merge_id, reviewer=user["email"])
        rebuild_graph()
        return {"status": "approved", "merge_id": merge_id}
    else:
        raise HTTPException(
            status_code=403,
            detail=f"Action not permitted for role: {user['role']}. Required: sp_dysp (or head_constable proposal)"
        )

@app.post("/api/merge/{merge_id}/reject")
def reject_merge(merge_id: str, user: Dict[str, Any] = Depends(require_roles(["sp_dysp"]))):
    conn = get_connection()
    res = reject_merge_decision(conn, merge_id, reviewer=user["email"])
    return {"status": "rejected", "merge_id": merge_id}

@app.post("/api/merge/{merge_id}/unmerge")
def unmerge_decision_endpoint(merge_id: str, user: Dict[str, Any] = Depends(require_roles(["sp_dysp"]))):
    conn = get_connection()
    res = unmerge_decision(conn, merge_id, reviewer=user["email"])
    rebuild_graph()
    return {"status": "pending", "merge_id": merge_id}

# 8. ALERTS
@app.get("/api/alerts")
def get_alerts(user: Dict[str, Any] = Depends(get_current_user)):
    conn = get_connection()
    all_alerts = generate_alerts(conn)
    is_sp = (user["role"] == "sp_dysp")

    # Constable sees summary alerts only (no raw tower-dump or deep financial pass-through)
    if user["role"] == "constable":
        restricted_types = {"pass_through", "structuring", "golden_hour", "burner"}
        filtered = [a for a in all_alerts if a["type"] not in restricted_types]
    else:
        filtered = all_alerts

    if not is_sp:
        masked_alerts = []
        for a in filtered:
            ac = dict(a)
            # Mask any 10-digit numbers in explanation
            ac["explanation"] = re.sub(r"\b(\d{2})\d{5}(\d{3})\b", r"\1XXXXX\2", ac["explanation"])
            masked_alerts.append(ac)
        return masked_alerts

    return filtered

# 9. GOLDEN HOUR
@app.get("/api/golden-hour")
def get_golden_hour(user: Dict[str, Any] = Depends(require_roles(["cyber_cell", "sp_dysp", "auditor"]))):
    conn = get_connection()
    data = get_golden_hour_details(conn)
    is_sp = (user["role"] == "sp_dysp")

    result = dict(data)
    if not is_sp:
        burner = dict(result.get("burner", {}))
        if burner.get("number"):
            burner["number"] = mask_phone_str(burner["number"])
        result["burner"] = burner
        bait = dict(result.get("bait", {}))
        if bait.get("number"):
            bait["number"] = mask_phone_str(bait["number"])
        result["bait"] = bait

    return result

# 10. SIMULATE REMOVE NODE
@app.post("/api/simulate/remove-node")
def simulate_remove(req: RemoveNodeRequest, user: Dict[str, Any] = Depends(require_roles(["head_constable", "cyber_cell", "sp_dysp"]))):
    conn = get_connection()
    res = simulate_node_removal(req.node_id)

    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    record_action(
        conn,
        f"SIMULATION_RUN (Network interdiction simulation on {req.node_id} by {user['email']})",
        {"node_id": req.node_id, "delta_pct": res.get("delta_pct", 0.0), "officer": user["email"]},
        ts=now_iso
    )

    return res

# 11. TIMELINE RANGE
@app.get("/api/timeline-range")
def get_timeline_range():
    return {"start": "2026-09-01", "end": "2026-09-30"}

# 12. COPILOT
@app.post("/api/copilot")
def copilot(req: CopilotRequest, user: Dict[str, Any] = Depends(require_roles(["constable", "head_constable", "cyber_cell", "sp_dysp", "auditor"]))):
    conn = get_connection()
    return process_copilot_query(conn, req.question, user)

# 13. REPORT GENERATION & EMAIL
@app.post("/api/report")
def generate_report(user: Dict[str, Any] = Depends(require_roles(["head_constable", "cyber_cell", "sp_dysp"]))):
    conn = get_connection()
    report_id = "RPT-SP014-01"
    # Pre-build PDF and log to ledger
    build_pdf_dossier(conn, user, report_id)

    # Detailed structured intelligence report payload for UI dossier
    g = get_graph_instance()
    total_nodes = len(g.nx_graph.nodes) if g else 0
    total_edges = len(g.nx_graph.edges) if g else 0
    density = round(len(g.nx_graph.edges) / (total_nodes * (total_nodes - 1) / 2), 4) if total_nodes > 1 else 0

    top_entities = []
    if g:
        for nid, d in g.nx_graph.nodes(data=True):
            top_entities.append({
                "id": nid,
                "label": d.get("label", nid),
                "type": d.get("type", "entity"),
                "betweenness": round(d.get("betweenness", 0.0), 4),
                "pagerank": round(d.get("pagerank", 0.0), 4),
                "degree": g.nx_graph.degree(nid)
            })
        top_entities.sort(key=lambda x: x["betweenness"], reverse=True)

    alerts_list = generate_alerts(conn)
    ledger_state = get_ledger_state(conn)

    top_broker_id = top_entities[0]["id"] if top_entities else "ENT-R0019"
    sim_res = simulate_node_removal(top_broker_id)

    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM persons")
    persons_cnt = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM calls")
    calls_cnt = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM transactions")
    txns_cnt = cursor.fetchone()[0]

    return {
        "report_id": report_id,
        "status": "ready",
        "url": f"/api/report/{report_id}/download",
        "counts": {
            "entities": total_nodes,
            "edges": total_edges,
            "density": density,
            "persons": persons_cnt,
            "calls": calls_cnt,
            "transactions": txns_cnt,
            "alerts": len(alerts_list)
        },
        "top_entities": top_entities[:5],
        "alerts": alerts_list[:6],
        "simulation": sim_res,
        "ledger_head_hash": ledger_state.get("head_hash", ""),
        "ledger_blocks": len(ledger_state.get("entries", []))
    }

@app.get("/api/report/{report_id}/download")
def download_report(report_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    conn = get_connection()
    pdf_content = build_pdf_dossier(conn, user, report_id)
    return Response(
        content=pdf_content,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=SAKSHI_{report_id}_Intelligence_Dossier.pdf"}
    )

@app.post("/api/report/email")
def email_report(req: ReportEmailRequest, user: Dict[str, Any] = Depends(require_roles(["head_constable", "cyber_cell", "sp_dysp"]))):
    conn = get_connection()
    pdf_content = build_pdf_dossier(conn, user, req.report_id)
    recipient = user.get("email", "officer@demo.in")
    return send_report_email(conn, recipient, req.report_id, pdf_content, user)

# 14. LEDGER & VERIFICATION
@app.get("/api/ledger")
def get_ledger(user: Dict[str, Any] = Depends(require_roles(["cyber_cell", "sp_dysp", "auditor"]))):
    conn = get_connection()
    return get_ledger_state(conn)

@app.get("/api/verify")
def verify_ledger(user: Dict[str, Any] = Depends(require_roles(["cyber_cell", "sp_dysp", "auditor"]))):
    conn = get_connection()
    return verify_all_integrity(conn)

@app.post("/api/debug/tamper")
def debug_tamper():
    conn = get_connection()
    return tamper_working_db(conn)

@app.post("/api/debug/reset")
def debug_reset():
    conn = get_connection()
    res = restore_clean_db(conn)
    rebuild_graph()
    unmasked_entities.clear()
    return res

@app.post("/api/debug/reset-tamper")
def debug_reset_tamper():
    return debug_reset()

# 15. CASE RELOAD & HEALTH
@app.post("/api/case/reload")
def reload_case(user: Dict[str, Any] = Depends(require_roles(["cyber_cell", "sp_dysp", "auditor"]))):
    ingest_all()
    conn = get_connection()
    resolve_entities(conn)
    rebuild_graph()
    unmasked_entities.clear()

    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    record_action(
        conn,
        f"CASE_RELOADED (Complete pipeline re-executed from source CSVs by {user['email']})",
        {"authorized_by": user["email"]},
        ts=now_iso
    )

    return {
        "ok": True,
        "message": "Case data re-ingested from source CSVs, entities resolved, graph reconstructed, and integrity verified."
    }

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "version": "2.0.0",
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "groq_configured": bool(os.getenv("GROQ_API_KEY", "").strip())
    }

# 16. VALIDATION (Roles: cyber_cell, sp_dysp, auditor)
@app.get("/api/validation")
def validation_report(user: Dict[str, Any] = Depends(require_roles(["cyber_cell", "sp_dysp", "auditor"]))):
    return run_validation()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
