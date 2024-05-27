using api.Data.Repositories.Interfaces;
using api.Models;
using api.Utilities.ActionFilters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  [Authorize]
  public class ClientController : ControllerBase
  {
    private const int DefaultPageSize = 20;
    private readonly IClientRepository _clientRepository;
    private readonly ILogRepository _logRepository;
    private readonly ILogger<ClientController> _logger;

    public ClientController(IClientRepository clientRepository, ILogRepository logRepository, ILogger<ClientController> logger)
    {
      _clientRepository = clientRepository ?? throw new ArgumentNullException(nameof(clientRepository), "O repositório do cliente não pode ser nulo.");
      _logRepository = logRepository;
      _logger = logger ?? throw new ArgumentNullException(nameof(logger), "O logger no cliente não pode ser nulo.");
    }

    private IActionResult HandleError(string methodName, string errorMessage, string parameterInfo = "")
    {
      _logger.LogError("{errorMessage}. Método: {methodName}, Parâmetros: {parameterInfo}", errorMessage, methodName, parameterInfo);
      return BadRequest(new { message = errorMessage });
    }

    private IActionResult? ValidatePageAndSize(int page, int pageSize)
    {
      if (page < 1 || pageSize < 1)
        return BadRequest("Página e tamanho da página têm que ser maiores que zero.");
      return null;
    }

    [HttpGet]
    public IActionResult GetAllClients(int page = 1, int pageSize = DefaultPageSize, string clientName = "")
    {
      var validationResult = ValidatePageAndSize(page, pageSize);
      if (validationResult != null) return validationResult;

      var whereClause = string.IsNullOrEmpty(clientName) ? "" : $"WHERE Name LIKE '%{clientName}%'";

      List<Client> clients = _clientRepository.GetAllClients(page, pageSize, clientName).ToList();
      int clientCount = _clientRepository.GetClientCount(whereClause);

      return Ok(new { clients, clientCount });
    }

    [HttpGet("{id}")]
    public IActionResult GetClientById(int id)
    {
      var client = _clientRepository.GetClientById(id);

      return client != null ? Ok(client) : NotFound(new { message = "Cliente não encontrado." });
    }

    [HttpGet("monthlyCount")]
    public IActionResult GetClientCountLastMonth()
    {
      var thirtyDaysAgo = DateTime.Today.AddDays(-30).ToString("dd/MM/yyyy");
      var monthlyClientCount = _clientRepository.GetClientCount($"WHERE CreationDate >= '{thirtyDaysAgo}'");

      return Ok(new { monthlyClientCount });
    }

    [HttpGet("inactiveCount")]
    public IActionResult GetInactiveClientCount()
    {
      var inactiveClientCount = _clientRepository.GetClientCount("WHERE Status = 1");

      return Ok(new { inactiveClientCount });
    }

    [HttpPost]
    [ServiceFilter(typeof(TokenToContextFilter))]
    public IActionResult AddClient([FromBody] Client clientAdd)
    {
      var result = _clientRepository.AddClient(clientAdd);

      if (result != null)
        return HandleError(nameof(AddClient), result, clientAdd.ToString());

      _logger.LogInformation("Cliente adicionado com sucesso: ID {clientAddId}. Método: {methodName}, Parâmetros: {clientAdd}", clientAdd.Id, nameof(AddClient), clientAdd);

      var userId = Convert.ToInt32(HttpContext.Items["UserId"]);
      _logRepository.AddLog(userId, "Cliente Adicionado", "Cliente adicionado com sucesso", clientAdd.Id, null, clientAdd);

      return CreatedAtAction(nameof(GetClientById), new { id = clientAdd.Id }, clientAdd);
    }

    [HttpPut("{id}")]
    [ServiceFilter(typeof(TokenToContextFilter))]
    public IActionResult UpdateClient(int id, Client client)
    {
      if (client == null)
        return HandleError(nameof(UpdateClient), "Cliente não pode ser nulo.", id.ToString());

      if (!Enum.IsDefined(typeof(Status), client.Status))
        return HandleError(nameof(UpdateClient), "Status inválido.", $"{id}, {client}");

      if (id != client.Id)
        return HandleError(nameof(UpdateClient), "ID do cliente não corresponde ao ID na URL.", $"{id}, {client}");

      var oldClient = _clientRepository.GetClientById(id);

      var updateMessage = _clientRepository.UpdateClient(client);

      if (updateMessage != null)
        return HandleError(nameof(UpdateClient), updateMessage, $"{id}, {client}");

      _logger.LogInformation("Cliente atualizado com sucesso: ID {clientId}. Método: {methodName}, Parâmetros: {id}, {client}", client.Id, nameof(UpdateClient), id, client);

      var userId = Convert.ToInt32(HttpContext.Items["UserId"]);
      _logRepository.AddLog(userId, "Cliente Alterado", "Cliente alterado com sucesso", client.Id, oldClient, client);

      return NoContent();
    }

    [HttpDelete("{id}")]
    [ServiceFilter(typeof(TokenToContextFilter))]
    public IActionResult DeleteClient(int id)
    {
      var deletedClient = _clientRepository.GetClientById(id);

      var deleteMessage = _clientRepository.DeleteClient(id);

      if (deleteMessage != null)
        return HandleError(nameof(DeleteClient), deleteMessage, id.ToString());

      _logger.LogInformation("Cliente excluído com sucesso: ID {id}. Método: {methodName}, Parâmetros: {id}", id, nameof(DeleteClient), id);

      var userId = Convert.ToInt32(HttpContext.Items["UserId"]);
      _logRepository.AddLog(userId, "Cliente Excluído", "Cliente excluído com sucesso", id, deletedClient, null);

      return NoContent();
    }
  }
}
