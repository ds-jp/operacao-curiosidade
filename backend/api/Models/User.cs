using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace api.Models
{
  public enum Theme
  {
    light,
    dark
  }

  public class User
  {
    public User()
    {
      Theme = Theme.light;
    }

    public int Id { get; set; }

    [Required(ErrorMessage = "O campo E-mail é obrigatório.")]
    [EmailAddress(ErrorMessage = "O campo E-mail não é um endereço de e-mail válido.")]
    public string Email { get; set; }

    [Required(ErrorMessage = "O campo Senha é obrigatório.")]
    [StringLength(23, MinimumLength = 8, ErrorMessage = "A senha deve ter entre 8 e 23 caracteres.")]
    public string Password { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public Theme Theme { get; set; }

    [JsonIgnore]
    public string ThemeName => Enum.GetName(typeof(Theme), Theme);
  }
}
