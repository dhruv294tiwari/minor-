def test_chat_verified_mait_flow(client):
    # Query matching the seeded entry "When will semester exams begin?"
    response = client.post("/api/chat", json={
        "query": "When are the semester exams going to start?"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["source"] == "MAIT_VERIFIED"
    assert "10 December 2026" in data["answer"] or "verified" in data["answer"].lower()
    assert data["matched_entry_id"] is not None
    assert data["query_log_id"] is not None


def test_chat_ai_generated_fallback_flow(client):
    # Query not in verified database (general academic topic)
    response = client.post("/api/chat", json={
        "query": "What is the difference between a backlog and a supplementary exam?"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["source"] == "AI_GENERATED"
    assert "backlog" in data["answer"].lower()
    assert data["matched_entry_id"] is None
    assert data["query_log_id"] is not None


def test_feedback_submission(client):
    # Ask a question to generate a query log
    chat_res = client.post("/api/chat", json={"query": "exam schedule"})
    query_log_id = chat_res.json()["query_log_id"]

    # Submit feedback
    fb_res = client.post("/api/feedback", json={
        "query_log_id": query_log_id,
        "rating": "helpful",
        "comment": "Very clear and helpful verified answer!"
    })
    assert fb_res.status_code == 201
    fb_data = fb_res.json()
    assert fb_data["rating"] == "helpful"
    assert fb_data["query_log_id"] == query_log_id


def test_clean_reasoning_tags():
    from app.services.llm_service import clean_reasoning_tags

    # Test complete think block
    res1 = clean_reasoning_tags("<think>thinking process</think>Actual response text")
    assert res1 == "Actual response text"

    # Test unclosed think block at the end
    res2 = clean_reasoning_tags("Actual response text<think>unclosed thinking")
    assert res2 == "Actual response text"

    # Test unclosed think block from the start (only thinking)
    res3 = clean_reasoning_tags("<think>only thinking process without closing tag")
    assert "mait.ac.in" in res3
    assert "consult" in res3

    # Test closed think block and unclosed think block
    res4 = clean_reasoning_tags("<think>thought 1</think>Actual response<think>thought 2")
    assert res4 == "Actual response"

    # Test no think block
    res5 = clean_reasoning_tags("Plain old response text")
    assert res5 == "Plain old response text"

    # Test empty or None input
    assert clean_reasoning_tags("") == ""
    assert clean_reasoning_tags(None) == ""
