def test_list_knowledge(client, auth_headers):
    response = client.get("/api/admin/knowledge", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["title"] == "Semester Exam Schedule 2026"


def test_create_knowledge_entry(client, auth_headers):
    cats = client.get("/api/admin/categories", headers=auth_headers).json()
    cat_id = cats[0]["id"]

    response = client.post(
        "/api/admin/knowledge",
        json={
            "category_id": cat_id,
            "title": "Admit Card Download Procedure",
            "question": "How do I download the exam admit card?",
            "answer": "Admit cards can be downloaded from the GGSIPU student portal 7 days before exams.",
            "keywords": "admit card, hall ticket, download",
            "source": "GGSIPU Examination Cell",
            "verified": True
        },
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Admit Card Download Procedure"
    assert data["verified"] is True
    assert data["id"] is not None


def test_update_knowledge_entry(client, auth_headers):
    entries = client.get("/api/admin/knowledge", headers=auth_headers).json()
    entry_id = next(e["id"] for e in entries if e["title"] == "Admit Card Download Procedure")

    response = client.put(
        f"/api/admin/knowledge/{entry_id}",
        json={
            "answer": "Updated: Admit cards can be downloaded from the GGSIPU student portal 10 days before exams.",
            "verified": True
        },
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "10 days" in data["answer"]


def test_search_knowledge_entries(client, auth_headers):
    response = client.get("/api/admin/knowledge?search=admit", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert "Admit Card" in data[0]["title"]


def test_delete_knowledge_entry(client, auth_headers):
    entries = client.get("/api/admin/knowledge", headers=auth_headers).json()
    entry_id = next(e["id"] for e in entries if e["title"] == "Admit Card Download Procedure")

    response = client.delete(f"/api/admin/knowledge/{entry_id}", headers=auth_headers)
    assert response.status_code == 200
    assert "deleted successfully" in response.json()["message"]
