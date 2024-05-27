using api.Data.Repositories.Interfaces;
using api.Models;
using api.Utilities;
using Dapper;
using System.Data.SqlClient;

namespace api.Data.Repositories
{
  public class ClientRepository : IClientRepository
  {
    private readonly DataContext _context;
    private readonly ILogger<ClientRepository> _logger;

    public ClientRepository(DataContext context, ILogger<ClientRepository> logger)
    {
      _context = context ?? throw new ArgumentNullException(nameof(context));
      _logger = logger;
    }

    public IEnumerable<Client> GetAllClients(int page, int pageSize, string clientName = "")
    {
      using (var connection = _context.CreateConnection())
      {
        var selectQuery =
            $@"
                SELECT *
                FROM Clients
                WHERE Removed = 0
                {(string.IsNullOrEmpty(clientName) ? "" : "AND Name LIKE @ClientName")}
                ORDER BY Id
                OFFSET {((page - 1) * pageSize)} ROWS
                FETCH NEXT {pageSize} ROWS ONLY;
            ";

        return connection.Query<Client>(selectQuery, new { ClientName = $"%{clientName}%" });
      }
    }

    public Client? GetClientById(int id)
    {
      using (var connection = _context.CreateConnection())
      {
        var selectQuery =
            @"
                SELECT *
                FROM Clients
                WHERE Id = @Id;
            ";

        return connection.QueryFirstOrDefault<Client>(selectQuery, new { Id = id });
      }
    }

    public int GetClientCount(string whereClause = "")
    {
      using (var connection = _context.CreateConnection())
      {
        var countQuery = $"SELECT COUNT(*) FROM Clients {(string.IsNullOrEmpty(whereClause) ? "WHERE" : $"{whereClause} AND")} Removed = 0";

        return connection.QueryFirstOrDefault<int>(countQuery);
      }
    }

    public string? AddClient(Client client)
    {
      if (client == null)
        throw new ArgumentNullException(nameof(client));

      if (EmailExists(client.Email))
        return ErrorMessages.DuplicateEmail;

      using (var connection = _context.CreateConnection())
      {
        var insertQuery =
            @"
                INSERT INTO Clients (Name, Status, Age, Email, Address, OtherInformation, Interests, Feelings, [Values], CreationDate)
                VALUES (@Name, @Status, @Age, @Email, @Address, @OtherInformation, @Interests, @Feelings, @Values, @CreationDate);
                SELECT SCOPE_IDENTITY();
            ";

        try
        {
          client.Id = connection.QueryFirstOrDefault<int>(insertQuery, client);
        }
        catch (SqlException ex)
        {
          _logger.LogError(ex, "Ocorreu um erro ao adicionar o cliente.");
          return "Ocorreu um erro ao adicionar o cliente. Tente novamente mais tarde.";
        }
      }

      return null;
    }

    public string? UpdateClient(Client client)
    {
      if (client == null)
        throw new ArgumentNullException(nameof(client));

      if (EmailExists(client.Email, client.Id))
        return ErrorMessages.DuplicateEmail;

      using (var connection = _context.CreateConnection())
      {
        var updateQuery =
            @"
                UPDATE Clients
                SET Name = @Name, Status = @Status, Age = @Age, Email = @Email, Address = @Address, OtherInformation = @OtherInformation, Interests = @Interests, Feelings = @Feelings, [Values] = @Values
                WHERE Id = @Id;
            ";

        try
        {
          connection.Execute(updateQuery, client);
        }
        catch (SqlException ex)
        {
          _logger.LogError(ex, "Ocorreu um erro ao atualizar o cliente.");
          return "Ocorreu um erro ao atualizar o cliente. Tente novamente mais tarde.";
        }
      }

      return null;
    }

    public bool EmailExists(string email, int clientIdToExclude = 0)
    {
      using (var connection = _context.CreateConnection())
      {
        var existingEmail = connection.QueryFirstOrDefault<string>(
            "SELECT Email FROM Clients WHERE Email = @Email AND Id <> @Id",
                new { Email = email, Id = clientIdToExclude });

        return existingEmail != null;
      }
    }

    public string? DeleteClient(int clientId)
    {
      using (var connection = _context.CreateConnection())
      {
        var deleteQuery = "UPDATE Clients SET Removed = 1 WHERE Id = @Id;";
        var affectedRows = connection.Execute(deleteQuery, new { Id = clientId });

        if (affectedRows == 0)
          return ErrorMessages.ClientNotFound;
      }

      return null;
    }
  }
}