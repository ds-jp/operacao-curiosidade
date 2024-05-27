using api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using System.Text.Json;

namespace api.Utilities.Middlewares
{
  public class CheckBlacklistedTokenMiddleware
  {
    private readonly RequestDelegate _next;

    public CheckBlacklistedTokenMiddleware(RequestDelegate next)
    {
      _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IAuthService authService)
    {
      var endpoint = context.GetEndpoint();
      var allowAnonymousAttribute = endpoint?.Metadata.GetMetadata<AllowAnonymousAttribute>();

      if (allowAnonymousAttribute != null)
      {
        await _next(context);

        return;
      }

      var authorizationHeader = context.Request.Headers["Authorization"].ToString();

      if (!string.IsNullOrEmpty(authorizationHeader) && authorizationHeader.StartsWith("Bearer "))
      {
        var token = authorizationHeader["Bearer ".Length..].Trim();

        if (authService.IsTokenBlacklisted(token))
        {
          await WriteJsonResponseAsync(context, 401, "Token is blacklisted.");

          return;
        }

        if (authService.IsTokenExpired(token))
        {
          authService.AddTokenToBlackList(token);
          await WriteJsonResponseAsync(context, 401, "Token has expired and is blacklisted.");

          return;
        }
      }

      await _next(context);
    }

    private static async Task WriteJsonResponseAsync(HttpContext context, int statusCode, string message)
    {
      var responseObj = new { message };

      context.Response.StatusCode = statusCode;
      context.Response.ContentType = "application/json";

      var jsonResponse = JsonSerializer.Serialize(responseObj);
      await context.Response.WriteAsync(jsonResponse);
    }
  }
}
