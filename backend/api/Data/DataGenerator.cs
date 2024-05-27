using api.Models;
using static BCrypt.Net.BCrypt;

namespace api.Data
{
  public class DataGenerator
  {
    public static List<User> Users { get; set; }
    public static List<Client> Clients { get; set; }
    public static List<Report> Reports { get; set; }

    static DataGenerator()
    {
      var random = new Random();

      var firstNames = new[] { "Ana", "Matheus", "Maria", "Pedro", "Lucas", "Julia", "Rafael", "Fernanda", "Carlos", "Amanda", "Miguel", "Beatriz", "Gustavo", "Thiago", "Bianca" };

      var lastNames = new[] { "Silva", "Santos", "Oliveira", "Souza", "Lima", "Pereira", "Ferreira", "Costa", "Martins", "Rocha", "Almeida", "Lopes", "Mendes", "Barbosa" };

      var userEmailSet = new HashSet<string>();
      Users = GenerateUsers(firstNames, lastNames, random, userEmailSet);

      var clientEmailSet = new HashSet<string>();
      Clients = GenerateClients(firstNames, lastNames, random, clientEmailSet);

      Reports = GenerateReports(random);
    }

    private static List<User> GenerateUsers(string[] firstNames, string[] lastNames, Random random, HashSet<string> emailSet)
    {
      var users = new List<User>
      {
        new User { Email = "user1@example.com", Password = HashPassword("password1") },
        new User { Email = "user2@example.com", Password = HashPassword("password2") }
      };

      emailSet.Add("user1@example.com");
      emailSet.Add("user2@example.com");

      for (var i = 2; i < 10; i++)
      {
        var firstName = firstNames[random.Next(firstNames.Length)];
        var lastName = lastNames[random.Next(lastNames.Length)];
        var randomNumber = random.Next(1000, 9999);
        var email = $"{firstName.ToLower()}.{lastName.ToLower()}{randomNumber}@exemplo.com";
        var password = $"password{i + 1}";

        while (emailSet.Contains(email))
        {
          firstName = firstNames[random.Next(firstNames.Length)];
          lastName = lastNames[random.Next(lastNames.Length)];
          randomNumber = random.Next(1000, 9999);
          email = $"{firstName.ToLower()}.{lastName.ToLower()}{randomNumber}@exemplo.com";
        }

        emailSet.Add(email);

        users.Add(new User
        {
          Email = email,
          Password = HashPassword(password)
        });
      }

      return users;
    }

    private static List<Client> GenerateClients(string[] firstNames, string[] lastNames, Random random, HashSet<string> emailSet)
    {
      var clients = new List<Client>();
      var streetNames = new[] { "Rua Primavera", "Avenida das Flores", "Avenida do Bosque", "Rua dos Ipês", "Rua das Margaridas", "Avenida das Acácias", "Rua dos Lírios", "Avenida das Orquídeas" };
      DateTime startDate = new DateTime(2022, 1, 1);
      int range = (DateTime.Today - startDate).Days;

      for (var i = 0; i < 82; i++)
      {
        var firstName = firstNames[random.Next(firstNames.Length)];
        var lastName = lastNames[random.Next(lastNames.Length)];
        var randomNumber = random.Next(1000, 9999);
        var email = $"{firstName.ToLower()}.{lastName.ToLower()}{randomNumber}@exemplo.com";

        while (emailSet.Contains(email))
        {
          firstName = firstNames[random.Next(firstNames.Length)];
          lastName = lastNames[random.Next(lastNames.Length)];
          randomNumber = random.Next(1000, 9999);
          email = $"{firstName.ToLower()}.{lastName.ToLower()}{randomNumber}@exemplo.com";
        }

        emailSet.Add(email);

        clients.Add(new Client
        {
          Status = Enum.Parse<Status>(GetRandomValue(random, new[] { "Ativo", "Inativo" })),
          Name = $"{firstName} {lastName}",
          Age = random.Next(18, 80),
          Email = email,
          Address = $"{streetNames[random.Next(streetNames.Length)]}, {random.Next(1, 999)}",
          OtherInformation = "N/A",
          Interests = GetRandomValue(random, new[] { "Leitura", "Cozinha", "Esportes", "Viagens", "Jardinagem" }),
          Feelings = GetRandomValue(random, new[] { "Feliz", "Empolgado", "Contente", "Pacífico", "Esperançoso" }),
          Values = GetRandomValue(random, new[] { "Honestidade", "Integridade", "Respeito", "Compaixão", "Persistência" }),
          CreationDate = startDate.AddDays(random.Next(range))
        });
      }

      return clients;
    }

    private static List<Report> GenerateReports(Random random)
    {
      var reports = new List<Report>();
      var reportNames = new[] { "Lista de Usuários" };

      for (var i = 0; i < 1; i++)
      {
        reports.Add(new Report
        {
          Name = reportNames[i]
        });
      }

      return reports;
    }

    private static string GetRandomValue(Random random, string[] values) =>
        values[random.Next(values.Length)];
  }
}
