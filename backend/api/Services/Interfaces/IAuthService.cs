using api.Models;

namespace api.Services.Interfaces
{
  public interface IAuthService
  {
    public void AddTokenToBlackList(string token);

    User AuthenticateUser(string email, string password);
    public string DecodeToken(string token);

    string GenerateToken(User user);
    public bool IsTokenBlacklisted(string token);
    public bool IsTokenExpired(string token);
  }
}
