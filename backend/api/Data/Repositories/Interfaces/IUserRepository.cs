using api.Models;

namespace api.Data.Repositories.Interfaces
{
  public interface IUserRepository
  {
    string? AddUser(User user);

    public User AuthenticateUser(User user);

    bool DeleteUser(User user);

    bool EmailExists(string userEmail, int userIdToExclude = 0);

    ICollection<User> GetAllUsers();

    User GetUserByEmail(string userEmail);

    User GetUserById(int userId);

    string UpdateUser(User user);

    bool UserExists(int userId);
  }
}
