using api.Models;

namespace api.Data.Repositories.Interfaces
{
  public interface IClientRepository
  {
    public IEnumerable<Client> GetAllClients(int page, int pageSize, string clientName = "");
    Client? GetClientById(int id);
    public int GetClientCount(string whereClause = "");
    string? AddClient(Client client);
    string? UpdateClient(Client client);
    bool EmailExists(string email, int clientIdToExclude = 0);
    string? DeleteClient(int id);
  }
}