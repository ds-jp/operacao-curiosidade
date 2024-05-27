using api.Data.Repositories.Interfaces;
using api.Models;
using api.Services.Interfaces;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace api.Services
{
  public class AuthService : IAuthService
  {
    private readonly IUserRepository _userRepository;
    private static List<string> BlackList = new List<string>();

    public AuthService(IUserRepository userRepository)
    {
      _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository), "O repositório do usuário não pode ser nulo.");
    }

    public User AuthenticateUser(string userEmail, string userPassword) =>
        _userRepository.AuthenticateUser(new User { Email = userEmail, Password = userPassword });

    public string GenerateToken(User user)
    {
      var tokenHandler = new JwtSecurityTokenHandler();
      var key = Encoding.ASCII.GetBytes("chave_secreta_ioujkl_kj");
      var tokenDescriptor = new SecurityTokenDescriptor
      {
        Subject = new ClaimsIdentity(new Claim[]
          {
            new Claim(ClaimTypes.Name, user.Id.ToString()),
            new Claim("email", user.Email)
          }),
        Expires = DateTime.UtcNow.AddHours(1),
        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
      };
      var token = tokenHandler.CreateToken(tokenDescriptor);
      return tokenHandler.WriteToken(token);
    }

    public void AddTokenToBlackList(string token) =>
        BlackList.Add(token);

    public bool IsTokenBlacklisted(string token) =>
        BlackList.Contains(token);

    public bool IsTokenExpired(string token)
    {
      var tokenHandler = new JwtSecurityTokenHandler();

      try
      {
        if (tokenHandler.ReadToken(token) is not JwtSecurityToken jwtToken)
          return true;

        return jwtToken.ValidTo.ToUniversalTime() <= DateTime.UtcNow;
      }
      catch (Exception)
      {
        return true;
      }
    }

    public string DecodeToken(string token)
    {
      var tokenHandler = new JwtSecurityTokenHandler();
      var jwtToken = tokenHandler.ReadJwtToken(token);
      var emailClaim = jwtToken.Claims.First(claim => claim.Type == "email");

      return emailClaim.Value;
    }
  }
}
