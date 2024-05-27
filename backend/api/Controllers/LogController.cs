using api.Data.Repositories;
using api.Data.Repositories.Interfaces;
using api.Models;
using api.Utilities.ActionFilters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  [Authorize]
  public class LogController : ControllerBase
  {
    private readonly ILogRepository _logRepository;

    public LogController(ILogRepository logRepository)
    {
      _logRepository = logRepository;
    }

    private IActionResult? ValidatePageAndSize(int page, int pageSize)
    {
      if (page < 1 || pageSize < 1)
        return BadRequest("Página e tamanho da página têm que ser maiores que zero.");
      return null;
    }

    [HttpGet]
    [ServiceFilter(typeof(TokenToContextFilter))]
    public IActionResult GetAllLogsByUser(int page = 1, int pageSize = 20, string search = "")
    {
      var validationResult = ValidatePageAndSize(page, pageSize);
      if (validationResult != null) return validationResult;

      var userId = Convert.ToInt32(HttpContext.Items["UserId"]);
      var token = HttpContext.Items["Token"] as string;

      if (string.IsNullOrEmpty(token))
        return BadRequest(new { message = "Token está ausente" });

      var logs = _logRepository.GetAllLogsByUser(page, pageSize, userId, search).ToList();
      int logCount = _logRepository.GetLogCount(userId, search);

      return Ok(new { logs, logCount });
    }
  }
}
