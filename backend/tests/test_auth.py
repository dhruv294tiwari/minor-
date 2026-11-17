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


def test_admin_change_password(client, auth_headers):
    # Wrong current password
    res_fail = client.post("/api/admin/change-password", headers=auth_headers, json={
        "current_password": "wrongcurrentpassword",
        "new_password": "brandnewpassword123"
    })
    assert res_fail.status_code == 400
    assert "Current password is incorrect" in res_fail.json()["detail"]

    # Short new password (<6 chars)
    res_short = client.post("/api/admin/change-password", headers=auth_headers, json={
        "current_password": "testpassword123",
        "new_password": "123"
    })
    assert res_short.status_code == 400

    # Successful change
    res_success = client.post("/api/admin/change-password", headers=auth_headers, json={
        "current_password": "testpassword123",
        "new_password": "brandnewpassword123"
    })
    assert res_success.status_code == 200
    assert "successfully" in res_success.json()["message"]

    # Verify login with new password
    login_new = client.post("/api/admin/login", json={
        "username": "testadmin",
        "password": "brandnewpassword123"
    })
    assert login_new.status_code == 200

    # Restore password back for other tests
    client.post("/api/admin/change-password", headers={"Authorization": f"Bearer {login_new.json()['access_token']}"}, json={
        "current_password": "brandnewpassword123",
        "new_password": "testpassword123"
    })


def test_admin_update_profile(client, auth_headers):
    res = client.put("/api/admin/profile", headers=auth_headers, json={
        "email": "updated_admin@mait.ac.in"
    })
    assert res.status_code == 200
    assert res.json()["email"] == "updated_admin@mait.ac.in"
