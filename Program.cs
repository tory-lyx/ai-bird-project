
using CentralServer.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddDbContext<BirdDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

builder.Services.AddHttpClient("AiServer", client =>
{
    client.BaseAddress = new Uri(
        builder.Configuration["AiServer:BaseUrl"]!
    );

    client.Timeout = TimeSpan.FromMinutes(5);
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClients", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("ReactPolicy");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider
        .GetRequiredService<BirdDbContext>();

    db.Database.EnsureCreated();
}

app.UseCors("AllowClients");

app.UseSwagger();
app.UseSwaggerUI();

app.MapControllers();

app.MapGet("/", () => new
{
    message = "AI Bird Lab Central Server is running!",
    status = "OK"
});

app.Run();
