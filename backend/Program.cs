using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Net.Http.Headers;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddHttpClient();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseHttpsRedirection();
app.UseCors();

// ────────────────────────────────────────────────────────────────────────────
// Spotify — exchange authorization code for access + refresh tokens
// Set Spotify:ClientId and Spotify:ClientSecret in appsettings.json or env vars
// ────────────────────────────────────────────────────────────────────────────
app.MapPost("/spotify/token", async (
    [FromBody] SpotifyTokenRequest req,
    IConfiguration config,
    IHttpClientFactory factory) =>
{
    var clientId = config["Spotify:ClientId"] ?? throw new InvalidOperationException("Spotify:ClientId not configured");
    var clientSecret = config["Spotify:ClientSecret"] ?? throw new InvalidOperationException("Spotify:ClientSecret not configured");

    var client = factory.CreateClient();
    var credentials = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}"));
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", credentials);

    var body = new FormUrlEncodedContent(new Dictionary<string, string>
    {
        ["grant_type"] = "authorization_code",
        ["code"] = req.Code,
        ["redirect_uri"] = req.RedirectUri,
    });

    var response = await client.PostAsync("https://accounts.spotify.com/api/token", body);
    var json = await response.Content.ReadAsStringAsync();

    return response.IsSuccessStatusCode
        ? Results.Ok(JsonDocument.Parse(json).RootElement)
        : Results.Problem(json, statusCode: (int)response.StatusCode);
})
.WithName("SpotifyToken")
.WithSummary("Exchange Spotify auth code for access/refresh tokens");

// ────────────────────────────────────────────────────────────────────────────
// Spotify — refresh an expired access token
// ────────────────────────────────────────────────────────────────────────────
app.MapPost("/spotify/refresh", async (
    [FromBody] SpotifyRefreshRequest req,
    IConfiguration config,
    IHttpClientFactory factory) =>
{
    var clientId = config["Spotify:ClientId"]!;
    var clientSecret = config["Spotify:ClientSecret"]!;

    var client = factory.CreateClient();
    var credentials = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}"));
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", credentials);

    var body = new FormUrlEncodedContent(new Dictionary<string, string>
    {
        ["grant_type"] = "refresh_token",
        ["refresh_token"] = req.RefreshToken,
    });

    var response = await client.PostAsync("https://accounts.spotify.com/api/token", body);
    var json = await response.Content.ReadAsStringAsync();

    return response.IsSuccessStatusCode
        ? Results.Ok(JsonDocument.Parse(json).RootElement)
        : Results.Problem(json, statusCode: (int)response.StatusCode);
})
.WithName("SpotifyRefresh")
.WithSummary("Refresh an expired Spotify access token");

// ────────────────────────────────────────────────────────────────────────────
// Push notifications — send via Expo Push API
// ────────────────────────────────────────────────────────────────────────────
app.MapPost("/notifications/send", async (
    [FromBody] PushNotificationRequest req,
    IHttpClientFactory factory) =>
{
    var client = factory.CreateClient();
    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

    var payload = new
    {
        to = req.ExpoPushToken,
        title = req.Title,
        body = req.Body,
        data = req.Data,
    };

    var response = await client.PostAsJsonAsync("https://exp.host/--/api/v2/push/send", payload);
    var json = await response.Content.ReadAsStringAsync();

    return response.IsSuccessStatusCode
        ? Results.Ok(JsonDocument.Parse(json).RootElement)
        : Results.Problem(json, statusCode: (int)response.StatusCode);
})
.WithName("SendPushNotification")
.WithSummary("Send an Expo push notification to a device");

// ────────────────────────────────────────────────────────────────────────────
// Health check
// ────────────────────────────────────────────────────────────────────────────
app.MapGet("/health", () => Results.Ok(new { status = "ok", timestamp = DateTime.UtcNow }))
   .WithName("Health");

app.Run();

// ── Request records ───────────────────────────────────────────────────────────
record SpotifyTokenRequest(string Code, string RedirectUri);
record SpotifyRefreshRequest(string RefreshToken);
record PushNotificationRequest(
    string ExpoPushToken,
    string Title,
    string Body,
    Dictionary<string, string>? Data = null);
