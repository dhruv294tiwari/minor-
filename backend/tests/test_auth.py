def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_admin_login_success(client):
    response = client.post("/api/admin/login", json={
        "username": "testadmin",
        "password": "testpassword123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["admin"]["username"] == "testadmin"


def test_admin_login_invalid_password(client):
    response = client.post("/api/admin/login", json={
        "username": "testadmin",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "detail" in response.json()


def test_admin_me_protected_route(client, auth_headers):
    # Without headers
    res_unauth = client.get("/api/admin/me")
    assert res_unauth.status_code == 401

    # With valid token
    res_auth = client.get("/api/admin/me", headers=auth_headers)
    assert res_auth.status_code == 200
    assert res_auth.json()["username"] == "testadmin"
