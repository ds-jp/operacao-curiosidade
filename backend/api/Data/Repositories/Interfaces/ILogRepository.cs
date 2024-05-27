using api.Models;

namespace api.Data.Repositories.Interfaces
{
  public interface ILogRepository
  {
    IEnumerable<Log> GetAllLogsByUser(int page, int pageSize, int userId, string search);

    int GetLogCount(int userId, string whereClause = "");

    void AddLog(int userId, string action, string details, int? clientId = null, object? oldClient = null, object? newClient = null);
  }
}
