#include "raylib.h"
#include <cmath>
#include <string>
#include <vector>

struct EntityNode {
    std::string name;
    Vector3 position;
    Color color;
};

struct Edge {
    int a;
    int b;
};

static Vector3 SphericalToCartesian(float radius, float yaw, float pitch) {
    Vector3 p{};
    p.x = radius * cosf(pitch) * cosf(yaw);
    p.y = radius * sinf(pitch);
    p.z = radius * cosf(pitch) * sinf(yaw);
    return p;
}

int main() {
    const int screenWidth = 1400;
    const int screenHeight = 900;

    InitWindow(screenWidth, screenHeight, "3D ER Diagram Sphere - School Accounting System");
    SetTargetFPS(60);

    Camera3D camera{};
    camera.position = { 0.0f, 4.0f, 18.0f };
    camera.target = { 0.0f, 0.0f, 0.0f };
    camera.up = { 0.0f, 1.0f, 0.0f };
    camera.fovy = 45.0f;
    camera.projection = CAMERA_PERSPECTIVE;

    std::vector<EntityNode> nodes = {
        {"Students",      {0,0,0}, SKYBLUE},
        {"Payments",      {0,0,0}, GREEN},
        {"Invoices",      {0,0,0}, ORANGE},
        {"Accounts",      {0,0,0}, YELLOW},
        {"Staff",         {0,0,0}, PINK},
        {"Budgets",       {0,0,0}, PURPLE},
        {"Departments",   {0,0,0}, RED},
        {"Receipts",      {0,0,0}, LIME},
        {"Scholarships",  {0,0,0}, GOLD},
        {"SalaryRecords", {0,0,0}, VIOLET}
    };

    std::vector<Edge> edges = {
        {0,1}, {0,2}, {0,8},
        {1,2}, {1,3}, {1,7},
        {2,3}, {2,7},
        {3,4}, {3,5}, {3,9},
        {4,6}, {4,9},
        {5,6}, {5,8},
        {6,0}, {7,0}, {8,1}, {9,4}
    };

    const float sphereRadius = 6.5f;
    float rotationY = 0.0f;
    float rotationX = 0.25f;
    float autoSpin = 0.0f;
    float zoom = 18.0f;
    bool dragging = false;
    Vector2 lastMouse = {0, 0};

    while (!WindowShouldClose()) {
        Vector2 mouse = GetMousePosition();

        if (IsMouseButtonPressed(MOUSE_LEFT_BUTTON)) {
            dragging = true;
            lastMouse = mouse;
        }
        if (IsMouseButtonReleased(MOUSE_LEFT_BUTTON)) {
            dragging = false;
        }

        if (dragging) {
            Vector2 delta = { mouse.x - lastMouse.x, mouse.y - lastMouse.y };
            rotationY += delta.x * 0.01f;
            rotationX += delta.y * 0.01f;
            if (rotationX > 1.2f) rotationX = 1.2f;
            if (rotationX < -1.2f) rotationX = -1.2f;
            lastMouse = mouse;
        } else {
            autoSpin += GetFrameTime() * 0.45f;
        }

        zoom -= GetMouseWheelMove() * 1.2f;
        if (zoom < 9.0f) zoom = 9.0f;
        if (zoom > 30.0f) zoom = 30.0f;

        camera.position = { 0.0f, 3.0f, zoom };
        UpdateCamera(&camera, CAMERA_CUSTOM);

        for (int i = 0; i < (int)nodes.size(); ++i) {
            float t = (float)i / (float)nodes.size();
            float yaw = t * 2.0f * PI + rotationY + autoSpin;

            // spread nodes from top to bottom like points on a sphere
            float pitch = -0.9f + 1.8f * t + 0.18f * sinf(GetTime() * 1.4f + i);
            pitch += rotationX;

            nodes[i].position = SphericalToCartesian(sphereRadius, yaw, pitch);
        }

        BeginDrawing();
        ClearBackground({12, 16, 28, 255});

        BeginMode3D(camera);

        DrawSphereWires({0, 0, 0}, sphereRadius, 20, 20, Fade(DARKBLUE, 0.35f));
        DrawSphere({0, 0, 0}, 1.3f, Fade(WHITE, 0.12f));
        DrawSphereWires({0, 0, 0}, 1.3f, 12, 12, Fade(RAYWHITE, 0.45f));

        // central database core
        DrawCube({0, 0, 0}, 2.2f, 1.0f, 2.2f, Fade(SKYBLUE, 0.45f));
        DrawCubeWires({0, 0, 0}, 2.2f, 1.0f, 2.2f, WHITE);

        // glowing data lines from center to nodes
        for (const auto& node : nodes) {
            DrawLine3D({0, 0, 0}, node.position, Fade(node.color, 0.65f));
        }

        // relationship lines between entities
        for (const auto& e : edges) {
            DrawLine3D(nodes[e.a].position, nodes[e.b].position, Fade(LIGHTGRAY, 0.50f));
        }

        // animated data pulses
        for (int i = 0; i < (int)nodes.size(); ++i) {
            float pulse = 0.5f + 0.5f * sinf(GetTime() * 2.3f + i);
            Vector3 p = Vector3Lerp({0, 0, 0}, nodes[i].position, pulse);
            DrawSphere(p, 0.13f, WHITE);
        }

        // nodes
        for (const auto& node : nodes) {
            DrawSphere(node.position, 0.52f, node.color);
            DrawSphereWires(node.position, 0.52f, 10, 10, WHITE);
        }

        EndMode3D();

        DrawRectangle(20, 20, 460, 145, Fade(BLACK, 0.45f));
        DrawText("3D Interconnected ER Sphere", 35, 30, 30, RAYWHITE);
        DrawText("System: School Accounting Database", 35, 68, 22, SKYBLUE);
        DrawText("Drag with left mouse to rotate", 35, 100, 20, LIGHTGRAY);
        DrawText("Mouse wheel = zoom", 35, 125, 20, LIGHTGRAY);

        DrawRectangle(screenWidth - 360, 20, 325, 240, Fade(BLACK, 0.40f));
        DrawText("Entity ideas", screenWidth - 335, 35, 26, RAYWHITE);
        int y = 70;
        for (const auto& node : nodes) {
            DrawCircle(screenWidth - 320, y + 8, 7, node.color);
            DrawText(node.name.c_str(), screenWidth - 300, y, 22, RAYWHITE);
            y += 22;
        }

        DrawText("Tip: replace names/edges to match your exact ER diagram.", 20, screenHeight - 38, 22, GOLD);

        EndDrawing();
    }

    CloseWindow();
    return 0;
}
