using api.Data;
using api.Models;
using Dapper;
using System.Data.SqlClient;

namespace Database
{
  public class DatabaseInitializer
  {
    private readonly string _connectionString;

    public DatabaseInitializer(string connectionString)
    {
      _connectionString = connectionString;
    }

    public void InitializeDatabase()
    {
      using (var connection = new SqlConnection(_connectionString))
      {
        connection.Open();

        EnsureDatabaseExists(connection, "opcuriosidade");

        connection.ChangeDatabase("opcuriosidade");

        CreateTables(connection);

        InsertDataIfTableIsEmpty<User>(connection, "Users");
        InsertDataIfTableIsEmpty<Client>(connection, "Clients");
        InsertDataIfTableIsEmpty<Report>(connection, "Reports");
      }
    }

    private void EnsureDatabaseExists(SqlConnection connection, string databaseName)
    {
      string checkDbQuery = "SELECT database_id FROM sys.databases WHERE name = @DatabaseName";
      int? dbId = connection.QueryFirstOrDefault<int?>(checkDbQuery, new { DatabaseName = databaseName });

      if (dbId == null)
      {
        string createDbQuery = $"CREATE DATABASE {databaseName}";
        connection.Execute(createDbQuery);
      }
    }

    private void CreateTables(SqlConnection connection)
    {
      CreateTableIfNotExists(connection, "Users",
          @"
              CREATE TABLE Users (
                  Id INT IDENTITY(1,1) PRIMARY KEY,
                  Email NVARCHAR(225) NOT NULL UNIQUE,
                  Password NVARCHAR(255) NOT NULL,
                  Theme NVARCHAR(20) NOT NULL
              );
          ");

      CreateTableIfNotExists(connection, "Clients",
          @"
              CREATE TABLE Clients (
                  Id INT IDENTITY(1,1) PRIMARY KEY,
                  Status NVARCHAR(20) NOT NULL,
                  Name NVARCHAR(225) NOT NULL,
                  Age INT NOT NULL,
                  Email NVARCHAR(225) NOT NULL UNIQUE,
                  Address NVARCHAR(225) NOT NULL,
                  OtherInformation NVARCHAR(225),
                  Interests NVARCHAR(225) NOT NULL,
                  Feelings NVARCHAR(225) NOT NULL,
                  [Values] NVARCHAR(225) NOT NULL,
                  CreationDate DATETIME NOT NULL,
                  Removed BIT NOT NULL DEFAULT 0
              );
          ");

      CreateTableIfNotExists(connection, "Reports",
          @"
              CREATE TABLE Reports (
                  Id INT IDENTITY(1,1) PRIMARY KEY,
                  Name NVARCHAR(225) NOT NULL
              );
          ");

      CreateTableIfNotExists(connection, "Logs",
          @"
              CREATE TABLE Logs (
                  Id INT IDENTITY(1,1) PRIMARY KEY,
                  UserId INT NOT NULL FOREIGN KEY (UserId) REFERENCES Users(Id),
                  Action NVARCHAR(50) NOT NULL,
                  ClientId INT FOREIGN KEY (ClientId) REFERENCES Clients(Id),
                  Timestamp DATETIME NOT NULL DEFAULT GETDATE(),
                  Details NVARCHAR(MAX),
              );
        ");
    }

    private void CreateTableIfNotExists(SqlConnection connection, string tableName, string createTableQuery)
    {
      string checkTableQuery = $"SELECT OBJECT_ID(@TableName, 'U')";
      int? tableId = connection.QueryFirstOrDefault<int?>(checkTableQuery, new { TableName = tableName });

      if (tableId == null)
      {
        connection.Execute(createTableQuery);
      }
    }

    private void InsertDataIfTableIsEmpty<T>(SqlConnection connection, string tableName)
    {
      if (!CheckIfTableHasData(connection, tableName))
      {
        var (insertQuery, data) = GetDataAndQuery<T>();
        connection.Execute(insertQuery, data);
      }
    }

    private (string insertQuery, IEnumerable<T> data) GetDataAndQuery<T>()
    {
      string insertQuery = null;
      IEnumerable<T> data = null;

      if (typeof(T) == typeof(User))
      {
        insertQuery =
            @"
                INSERT INTO Users (Email, Password, Theme)
                VALUES (@Email, @Password, @Theme);
            ";
        data = DataGenerator.Users as IEnumerable<T>;
      }
      else if (typeof(T) == typeof(Client))
      {
        insertQuery =
            @"
                INSERT INTO Clients (Status, Name, Age, Email, Address, OtherInformation, Interests, Feelings, [Values], CreationDate)
                VALUES (@Status, @Name, @Age, @Email, @Address, @OtherInformation, @Interests, @Feelings, @Values, @CreationDate);
            ";
        data = DataGenerator.Clients as IEnumerable<T>;
      }
      else if (typeof(T) == typeof(Report))
      {
        insertQuery =
            @"
                INSERT INTO Reports (Name)
                VALUES (@Name);
            ";
        data = DataGenerator.Reports as IEnumerable<T>;
      }

      return (insertQuery, data);
    }

    private bool CheckIfTableHasData(SqlConnection connection, string tableName)
    {
      string checkTableQuery = $"SELECT COUNT(*) FROM {tableName}";
      int count = connection.QueryFirstOrDefault<int>(checkTableQuery);
      return count > 0;
    }
  }
}
