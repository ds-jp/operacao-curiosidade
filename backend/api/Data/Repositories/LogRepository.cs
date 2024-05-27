using api.Data.Repositories.Interfaces;
using api.Models;
using Dapper;
using System.Data.SqlClient;
using System.Text.Json;

namespace api.Data.Repositories
{
  public class LogRepository : ILogRepository
  {
    private readonly DataContext _context;
    private readonly ILogger<LogRepository> _logger;

    public LogRepository(DataContext context, ILogger<LogRepository> logger)
    {
      _context = context ?? throw new ArgumentNullException(nameof(context));
      _logger = logger;
    }

    public IEnumerable<Log> GetAllLogsByUser(int page, int pageSize, int userId, string search)
    {
      using (var connection = _context.CreateConnection())
      {
        var selectQuery =
        $@"
            SELECT Logs.*, Clients.Name + ' ' + Clients.Email as Client
            FROM Logs
            LEFT JOIN Clients ON Logs.ClientId = Clients.Id
            WHERE Logs.UserId = @UserId
            {(string.IsNullOrEmpty(search) ? "" : "AND Logs.Action LIKE @Search")}
            ORDER BY Logs.Id DESC
            OFFSET {((page - 1) * pageSize)} ROWS
            FETCH NEXT {pageSize} ROWS ONLY;
        ";

        return connection.Query<Log>(selectQuery, new { UserId = userId, Search = $"%{search}%" });
      }
    }

    public int GetLogCount(int userId, string search = "")
    {
      using (var connection = _context.CreateConnection())
      {
        var countQuery =
        $@"
            SELECT COUNT(*) FROM Logs
            WHERE Logs.UserId = @UserId
            {(string.IsNullOrEmpty(search) ? "" : $"AND Action LIKE @Search")}
        ";

        return connection.QueryFirstOrDefault<int>(countQuery, new { UserId = userId, Search = $"%{search}%" });
      }
    }

    public void AddLog(int userId, string action, string details, int? clientId = null, object? oldClient = null, object? newClient = null)
    {
      using (var connection = _context.CreateConnection())
      {
        var insertQuery =
            @"
                INSERT INTO Logs(UserId, Action" + (clientId != null ? ", ClientId" : "") + @", Details)
                VALUES (@UserId, @Action" + (clientId != null ? ", @ClientId" : "") + @", @Details);
            ";

        try
        {
          if (clientId != null)
          {
            details = JsonSerializer.Serialize(new
            {
              OldClient = oldClient,
              NewClient = newClient,
              ActionDetails = details
            });
          }
          else
          {
            details = JsonSerializer.Serialize(new { ActionDetails = details });
          }

          connection.Execute(insertQuery, new { UserId = userId, Action = action, ClientId = clientId, Details = details });
        }
        catch (SqlException ex)
        {
          _logger.LogError(ex, "Ocorreu um erro ao criar o log no banco de dados. UserId: {UserId}, Action: {Action}, ClientId: {ClientId}", userId, action, clientId);
        }
      }
    }

  }
}
