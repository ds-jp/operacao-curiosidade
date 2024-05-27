using api.Models;
using System.Linq.Expressions;

namespace api.Data.Repositories.Interfaces
{
  public interface IReportRepository
  {
    IEnumerable<Report> GetAllReports(int page, int pageSize);
    IEnumerable<Report> GetAllReportsByName(int page, int pageSize, string reportName);
    Report? GetReportById(int id);
    public int GetReportCount(string whereClause = "");
  }
}
