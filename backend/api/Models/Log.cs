namespace api.Models
{
  public class Log
  {
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Action { get; set; }
    public int? ClientId { get; set; }
    public DateTime Timestamp { get; set; }
    public string Details { get; set; }
    public string? Client { get; set; }
  }
}
