def test_list_categories(client, auth_headers):
    response = client.get("/api/admin/categories", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["name"] == "Examinations"
    assert data[0]["entries_count"] >= 1


def test_create_category(client, auth_headers):
    response = client.post(
        "/api/admin/categories",
        json={"name": "Scholarships", "description": "Merit and financial scholarships"},
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Scholarships"
    assert data["id"] is not None


def test_create_duplicate_category(client, auth_headers):
    response = client.post(
        "/api/admin/categories",
        json={"name": "Scholarships", "description": "Duplicate category"},
        headers=auth_headers
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_update_category(client, auth_headers):
    # Fetch existing category
    cats = client.get("/api/admin/categories", headers=auth_headers).json()
    cat_id = next(c["id"] for c in cats if c["name"] == "Scholarships")

    response = client.put(
        f"/api/admin/categories/{cat_id}",
        json={"name": "Scholarships & Financial Aid", "description": "Updated description"},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Scholarships & Financial Aid"


def test_safe_delete_category_with_entries(client, auth_headers):
    # Examinations category has an entry attached
    cats = client.get("/api/admin/categories", headers=auth_headers).json()
    exam_cat = next(c for c in cats if c["name"] == "Examinations")

    # Should fail deletion
    response = client.delete(f"/api/admin/categories/{exam_cat['id']}", headers=auth_headers)
    assert response.status_code == 400
    assert "Cannot delete category" in response.json()["detail"]


def test_delete_empty_category(client, auth_headers):
    cats = client.get("/api/admin/categories", headers=auth_headers).json()
    sch_cat = next(c for c in cats if "Scholarships" in c["name"])

    response = client.delete(f"/api/admin/categories/{sch_cat['id']}", headers=auth_headers)
    assert response.status_code == 200
    assert "deleted successfully" in response.json()["message"]
