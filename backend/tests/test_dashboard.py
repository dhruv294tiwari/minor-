def test_dashboard_statistics(client, auth_headers):
    # Ensure there are some queries in the database
    client.post("/api/chat", json={"query": "exam dates"})
    client.post("/api/chat", json={"query": "random query about calculus"})

    response = client.get("/api/admin/dashboard", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()

    assert data["total_entries"] >= 1
    assert data["total_categories"] >= 1
    assert data["total_queries"] >= 2
    assert "verified_queries_count" in data
    assert "ai_generated_queries_count" in data
    assert "verified_percentage" in data
    assert len(data["recent_queries"]) >= 2
    assert len(data["category_breakdown"]) >= 1


def test_queries_log_endpoint(client, auth_headers):
    # Test query logging endpoint with filter
    response = client.get("/api/admin/queries?source_type=MAIT_VERIFIED", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    for q in data:
        assert q["source_type"] == "MAIT_VERIFIED"
