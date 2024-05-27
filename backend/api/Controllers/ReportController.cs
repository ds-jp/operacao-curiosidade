using api.Data.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  [Authorize]
  public class ReportController : ControllerBase
  {
    private const int DefaultPageSize = 20;
    private readonly IReportRepository _reportRepository;

    public ReportController(IReportRepository reportRepository)
    {
      _reportRepository = reportRepository ?? throw new ArgumentNullException(nameof(reportRepository), "O repositório do relatório não pode ser nulo.");
    }

    private IActionResult? ValidatePageAndSize(int page, int pageSize)
    {
      if (page < 1 || pageSize < 1)
        return BadRequest("Página e tamanho da página têm que ser maiores que zero.");
      return null;
    }

    [HttpGet]
    public IActionResult GetAllReports(int page = 1, int pageSize = DefaultPageSize)
    {
      var validationResult = ValidatePageAndSize(page, pageSize);
      if (validationResult != null) return validationResult;

      var reports =
          _reportRepository
              .GetAllReports(page, pageSize)
              .ToList();

      var reportCount = _reportRepository.GetReportCount();

      return Ok(new { reports, reportCount });
    }

    [HttpGet("search")]
    public IActionResult GetAllReportsByName(int page = 1, int pageSize = DefaultPageSize, string ReportName = "")
    {
      var validationResult = ValidatePageAndSize(page, pageSize);
      if (validationResult != null) return validationResult;

      var whereClause = !string.IsNullOrWhiteSpace(ReportName) ? $"WHERE Name LIKE '%{ReportName}%'" : "";

      var reports =
          _reportRepository
              .GetAllReportsByName(page, pageSize, ReportName)
              .ToList();

      var reportCount = _reportRepository.GetReportCount(whereClause);

      return Ok(new { reports, reportCount });
    }

    [HttpGet("{id}")]
    public IActionResult GetReportById(int id)
    {
      var report = _reportRepository.GetReportById(id);

      return report != null ? Ok(report) : NotFound(new { message = "Report não encontrado." });
    }
  }
}
