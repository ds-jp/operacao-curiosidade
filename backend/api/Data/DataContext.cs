using System.Data;
using System.Data.SqlClient;

namespace api.Data
{
  public class DataContext
  {
    private readonly string _connectionString;

    public DataContext(string connectionString)
    {
      _connectionString = connectionString;
    }

    public IDbConnection CreateConnection()
    {
      var connection = new SqlConnection(_connectionString);
      connection.Open();

      connection.ChangeDatabase("opcuriosidade");

      return connection;
    }
  }
}

