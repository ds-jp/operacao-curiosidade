using api.Data;
using api.Data.Repositories;
using api.Data.Repositories.Interfaces;
using api.Services;
using api.Services.Interfaces;
using api.Utilities.ActionFilters;
using api.Utilities.Configurations;
using api.Utilities.Middlewares;
using Database;
using Serilog;
using Serilog.Events;

var logId = DateTime.Now.ToString("yyyy.MM.dd_HH-mm");
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Filter.ByIncludingOnly(e => !e.RenderMessage().Contains("GET"))
    .Filter.ByIncludingOnly(e => !e.RenderMessage().Contains("/theme"))
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.File($"logs/log-{logId}.txt")
    .CreateLogger();

try
{
  var builder = WebApplication.CreateBuilder(args);

  builder.Host.UseSerilog();

  builder.Configuration.AddJsonFile("appsettings.json");

  builder.Services.AddControllers();
  builder.Services.ConfigureJwt();

  var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

  builder.Services.AddScoped<DataContext>(_ => new DataContext(connectionString));

  builder.Services.AddScoped<IUserRepository, UserRepository>();
  builder.Services.AddScoped<IClientRepository, ClientRepository>();
  builder.Services.AddScoped<IReportRepository, ReportRepository>();
  builder.Services.AddScoped<ILogRepository, LogRepository>();
  builder.Services.AddScoped<IAuthService, AuthService>();

  builder.Services.AddScoped<TokenToContextFilter>();

  builder.Services.AddCors(options =>
  {
    options.AddPolicy("AllowAll", builder =>
    {
      builder
          .AllowAnyOrigin()
          .AllowAnyMethod()
          .AllowAnyHeader();
    });
  });

  builder.Services.ConfigureSwagger();

  var app = builder.Build();

  if (app.Environment.IsDevelopment())
  {
    app.UseSwagger();
    app.UseSwaggerUI();
  }

  app.UseCors("AllowAll");
  app.UseHttpsRedirection();
  app.UseMiddleware<CheckBlacklistedTokenMiddleware>();
  app.UseAuthentication();
  app.UseAuthorization();
  app.UseSerilogRequestLogging();

  var databaseInitializer = new DatabaseInitializer(connectionString);
  databaseInitializer.InitializeDatabase();

  app.MapControllers();

  app.Run();
}
catch (Exception ex)
{
  Log.Fatal(ex, "A aplicação falhou ao iniciar.");
}
finally
{
  Log.CloseAndFlush();
}
