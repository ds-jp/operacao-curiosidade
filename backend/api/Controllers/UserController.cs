using api.Data.Repositories;
using api.Data.Repositories.Interfaces;
using api.Models;
using api.Services.Interfaces;
using api.Utilities;
using api.Utilities.ActionFilters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Text.Json;

namespace api.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  [Authorize]
  public class UserController : ControllerBase
  {
    private readonly IUserRepository _userRepository;
    private readonly ILogRepository _logRepository;
    private readonly IAuthService _authService;
    private readonly ILogger<UserController> _logger;

    public UserController(IUserRepository userRepository, ILogRepository logRepository, IAuthService authService, ILogger<UserController> logger)
    {
      _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository), "O repositório do usuário não pode ser nulo.");
      _logRepository = logRepository;
      _authService = authService ?? throw new ArgumentNullException(nameof(authService), "O serviço de autenticação não pode ser nulo.");
      _logger = logger;
    }

    [HttpGet]
    public ActionResult GetAllUsers()
    {
      var users = _userRepository.GetAllUsers();

      return users.Any() ? Ok(users) : NotFound("Nenhum usuário encontrado.");
    }

    [HttpGet("{userId:int}")]
    public ActionResult GetUserById(int userId)
    {
      var user = _userRepository.GetUserById(userId);

      return user != null ? Ok(user) : NotFound($"Usuário com ID {userId} não encontrado.");
    }

    [HttpGet("email/{userEmail}")]
    public ActionResult GetUserByEmail(string userEmail)
    {
      if (string.IsNullOrEmpty(userEmail))
        return BadRequest("E-mail inválido.");

      var user = _userRepository.GetUserByEmail(userEmail);

      return user != null ? Ok(user) : NotFound($"Usuário com e-mail {userEmail} não encontrado.");
    }

    [HttpPost]
    public ActionResult AddUser([FromBody] User userAdd)
    {
      var result = _userRepository.AddUser(userAdd);

      if (result != null)
      {
        _logger.LogError("Erro ao adicionar usuário: {result}. Método: {methodName}, Parâmetros: {userAdd}", result, nameof(AddUser), userAdd);
        return result.Contains(ErrorMessages.DuplicateUserId) || result.Contains(ErrorMessages.DuplicateEmail) ?
            Conflict(result) : BadRequest(result);
      }

      _logger.LogInformation("Usuário adicionado com sucesso: ID {userAddId}. Método: {methodName}, Parâmetros: {userAdd}", userAdd.Id, nameof(AddUser), userAdd);
      return CreatedAtAction(nameof(GetUserById), new { userId = userAdd.Id }, userAdd);
    }

    [HttpPut]
    public IActionResult UpdateUser([FromBody] User updatedUser)
    {
      var result = _userRepository.UpdateUser(updatedUser);

      switch (result)
      {
        case ErrorMessages.UserNotFound:
          _logger.LogWarning("Usuário não encontrado ao tentar atualizar. Método: {methodName}, Parâmetros: {updatedUser}", nameof(UpdateUser), updatedUser);
          return NotFound(result);
        case ErrorMessages.DuplicateEmail:
          _logger.LogWarning("E-mail duplicado ao tentar atualizar. Método: {methodName}, Parâmetros: {updatedUser}", nameof(UpdateUser), updatedUser);
          return Conflict(result);
        case ErrorMessages.InvalidUserData:
          _logger.LogWarning("Dados inválidos ao tentar atualizar. Método: {methodName}, Parâmetros: {updatedUser}", nameof(UpdateUser), updatedUser);
          return BadRequest(result);
        default:
          _logger.LogInformation("Usuário atualizado com sucesso: ID {0}. Método: {methodName}, Parâmetros: {updatedUser}", updatedUser.Id, nameof(UpdateUser), updatedUser);
          return Ok(result);
      }
    }

    [HttpDelete("{userId}")]
    public IActionResult DeleteUser(int userId)
    {
      if (_userRepository.UserExists(userId))
      {
        var userToDelete = _userRepository.GetUserById(userId);
        _userRepository.DeleteUser(userToDelete);
        _logger.LogInformation("Usuário excluído com sucesso: ID {userId}. Método: {methodName}, Parâmetros: {userId}", userId, nameof(DeleteUser), userId);
        return Ok($"Usuário com ID {userId} foi excluído com sucesso.");
      }

      _logger.LogWarning("Usuário não encontrado ao tentar deletar. ID: {userId}. Método: {methodName}, Parâmetros: {userId}", userId, nameof(DeleteUser), userId);
      return NotFound($"Usuário com ID {userId} não encontrado.");
    }

    [HttpGet]
    [Route("token/expiration")]
    public IActionResult GetTokenExpiration([FromHeader(Name = "Authorization")] string token)
    {
      var jwtToken = new JwtSecurityToken(token.Replace("Bearer ", ""));
      var expiration = jwtToken.ValidTo;
      return Ok(new { expiration });
    }

    [HttpGet("{userEmail}/theme")]
    public IActionResult GetUserTheme(string userEmail)
    {
      var user = _userRepository.GetUserByEmail(userEmail);
      if (user == null)
      {
        return NotFound(new { message = $"Usuário com o e-mail {userEmail} não encontrado." });
      }

      return Ok(new { theme = Enum.GetName(typeof(Theme), user.Theme) });
    }

    [HttpPut("{userEmail}/theme")]
    public IActionResult SetUserTheme(string userEmail, [FromBody] JsonElement themeJson)
    {
      var user = _userRepository.GetUserByEmail(userEmail);
      if (user == null)
      {
        return NotFound(new { message = $"Usuário com o e-mail {userEmail} não encontrado." });
      }

      if (themeJson.TryGetProperty("theme", out JsonElement themeProperty))
      {
        string theme = themeProperty.GetString();
        if (Enum.TryParse(typeof(Theme), theme, true, out object themeValue))
        {
          user.Theme = (Theme)themeValue;
          _userRepository.UpdateUser(user);

          return Ok(new { theme });
        }
      }

      return BadRequest(new { message = "Tema inválido." });
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public IActionResult Login([FromBody] User user)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var authenticatedUser = _authService.AuthenticateUser(user.Email, user.Password);

      if (authenticatedUser != null)
      {
        var token = _authService.GenerateToken(authenticatedUser);

        _logger.LogInformation("Login realizado com sucesso para o usuário com e-mail: {authenticatedUserEmail}", authenticatedUser.Email);
        _logRepository.AddLog(authenticatedUser.Id, "Login", "Logou no sistema");

        return Ok(new { Message = "Login realizado com sucesso.", User = authenticatedUser.Email, Token = token });
      }

      _logger.LogWarning("Tentativa de login com credenciais inválidas para o usuário: {userEmail}", user.Email);
      return Unauthorized(new { Message = "Credenciais inválidas." });
    }

    [HttpPost("logout")]
    [ServiceFilter(typeof(TokenToContextFilter))]
    public IActionResult Logout()
    {
      var userId = Convert.ToInt32(HttpContext.Items["UserId"]);
      var userEmail = HttpContext.Items["UserEmail"] as string;
      var token = HttpContext.Items["Token"] as string;

      if (string.IsNullOrEmpty(token))
        return BadRequest(new { message = "Token está ausente" });

      _authService.AddTokenToBlackList(token);

      _logger.LogInformation("Logout realizado com sucesso para o usuário com e-mail: {userEmail}", userEmail);
      _logRepository.AddLog(userId, "Logout", "Deslogou do sistema");

      return Ok(new { message = $"Logout realizado com sucesso para o usuário com e-mail: {userEmail}" });
    }
  }
}
