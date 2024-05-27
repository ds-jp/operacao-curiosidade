using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace api.Models
{
  public enum Status
  {
    Ativo,
    Inativo
  }

  public class Client
  {
    public Client() : this(null)
    {
    }

    public Client(DateTime? creationDate)
    {
      CreationDate = creationDate ?? DateTime.Now;
      Status = Status.Ativo;
    }
    public int Id { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public Status Status { get; set; }

    public string Name { get; set; }
    public int Age { get; set; }

    [EmailAddress(ErrorMessage = "O campo Email não é um endereço de email válido.")]
    public string Email { get; set; }
    public string Address { get; set; }
    public string OtherInformation { get; set; }
    public string Interests { get; set; }
    public string Feelings { get; set; }
    public string Values { get; set; }
    public DateTime CreationDate { get; set; }
    public bool Removed { get; set; }

    [JsonIgnore]
    public string StatusName => Enum.GetName(typeof(Status), Status);
  }
}
