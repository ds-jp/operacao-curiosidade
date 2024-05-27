using api.Data.Repositories.Interfaces;
using api.Models;
using Dapper;

namespace api.Data.Repositories
{
  public class ReportRepository : IReportRepository
  {
    private readonly DataContext _context;

    public ReportRepository(DataContext context)
    {
      _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public IEnumerable<Report> GetAllReports(int page, int pageSize)
    {
      using (var connection = _context.CreateConnection())
      {
        var selectQuery =
            $@"
                SELECT *
                FROM Reports
                ORDER BY Id
                OFFSET {((page - 1) * pageSize)} ROWS
                FETCH NEXT {pageSize} ROWS ONLY;
            ";

        return connection.Query<Report>(selectQuery);
      }
    }

    public IEnumerable<Report> GetAllReportsByName(int page, int pageSize, string reportName)
    {
      using (var connection = _context.CreateConnection())
      {
        var selectQuery =
            $@"
                SELECT *
                FROM Reports
                WHERE Name LIKE @ReportName
                ORDER BY Id
                OFFSET {((page - 1) * pageSize)} ROWS
                FETCH NEXT {pageSize} ROWS ONLY;
            ";

        return connection.Query<Report>(selectQuery, new { ReportName = $"%{reportName}%" });
      }
    }

    public Report GetReportById(int id)
    {
      using (var connection = _context.CreateConnection())
      {
        var selectQuery =
            @"
                SELECT *
                FROM Reports
                WHERE Id = @Id;
            ";

        return connection.QueryFirstOrDefault<Report>(selectQuery, new { Id = id });
      }
    }

    public int GetReportCount(string whereClause = "")
    {
      using (var connection = _context.CreateConnection())
      {
        var countQuery = $"SELECT COUNT(*) FROM Reports {whereClause}";

        return connection.QueryFirstOrDefault<int>(countQuery);
      }
    }
  }
}
