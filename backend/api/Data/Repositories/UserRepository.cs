using api.Data.Repositories.Interfaces;
using api.Models;
using api.Utilities;
using Dapper;
using static BCrypt.Net.BCrypt;

namespace api.Data.Repositories
{
  public class UserRepository : IUserRepository
  {
    private readonly DataContext _context;

    public UserRepository(DataContext context)
    {
      _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public string? AddUser(User user)
    {
      if (user == null)
        return ErrorMessages.NullUserData;

      if (UserExists(user.Id))
        return ErrorMessages.DuplicateUserId;

      if (EmailExists(user.Email))
        return ErrorMessages.DuplicateEmail;

      if (!IsUserDataValid(user))
        return ErrorMessages.InvalidUserData;

      user.Password = HashPassword(user.Password);

      using (var connection = _context.CreateConnection())
      {
        var insertQuery =
            @"
                INSERT INTO Users (Email, Password, Theme)
                VALUES (@Email, @Password, @Theme);
                SELECT SCOPE_IDENTITY();
            ";

        user.Id = connection.QueryFirstOrDefault<int>(insertQuery, user);
      }

      return null;
    }

    public User AuthenticateUser(User user)
    {
      using (var connection = _context.CreateConnection())
      {
        var selectQuery =
            @"
                SELECT * FROM Users WHERE Email = @Email;
            ";

        var dbUser = connection.QueryFirstOrDefault<User>(selectQuery, new { Email = user.Email });

        if (dbUser != null)
        {
          if (Verify(user.Password, dbUser.Password))
          {
            return dbUser;
          }
        }

        return null;
      }
    }

    public bool DeleteUser(User user)
    {
      using (var connection = _context.CreateConnection())
      {
        var deleteQuery =
            @"
                DELETE FROM Users WHERE Id = @Id;
            ";

        var affectedRows = connection.Execute(deleteQuery, new { Id = user.Id });

        return affectedRows > 0;
      }
    }

    public bool EmailExists(string userEmail, int userIdToExclude = 0)
    {
      using (var connection = _context.CreateConnection())
      {
        var existingUser = GetUserByEmail(userEmail);
        return existingUser != null && existingUser.Id != userIdToExclude;
      }
    }

    public ICollection<User> GetAllUsers()
    {
      using (var connection = _context.CreateConnection())
      {
        var selectQuery =
            @"
                SELECT * FROM Users;
            ";

        return connection.Query<User>(selectQuery).ToList();
      }
    }

    public User GetUserByEmail(string userEmail)
    {
      using (var connection = _context.CreateConnection())
      {
        var selectQuery =
            @"
                SELECT * FROM Users WHERE Email = @Email;
            ";

        return connection.QueryFirstOrDefault<User>(selectQuery, new { Email = userEmail });
      }
    }

    public User GetUserById(int userId)
    {
      using (var connection = _context.CreateConnection())
      {
        var selectQuery =
            @"
                SELECT * FROM Users WHERE Id = @Id;
            ";

        return connection.QueryFirstOrDefault<User>(selectQuery, new { Id = userId });
      }
    }

    public string UpdateUser(User user)
    {
      if (user == null)
        return ErrorMessages.NullUserData;

      if (!IsUserDataValid(user))
        return ErrorMessages.InvalidUserData;

      var existingUser = GetUserById(user.Id);

      if (existingUser == null)
        return ErrorMessages.UserNotFound;

      if (EmailExists(user.Email, user.Id) && existingUser.Email != user.Email)
        return ErrorMessages.DuplicateEmail;

      using (var connection = _context.CreateConnection())
      {
        var updateQuery =
            @"
                UPDATE Users SET Theme = @Theme WHERE Id = @Id;
            ";

        var affectedRows = connection.Execute(updateQuery, user);

        return affectedRows > 0 ? "Usuário atualizado com sucesso." : "Falha ao atualizar usuário.";
      }
    }

    public bool UserExists(int userId)
    {
      using (var connection = _context.CreateConnection())
      {
        var existingUser = GetUserById(userId);
        return existingUser != null;
      }
    }

    private bool IsUserDataValid(User user) =>
      user != null && !string.IsNullOrEmpty(user.Email) && !string.IsNullOrEmpty(user.Password);
  }
}
