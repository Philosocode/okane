var builder = WebApplication.CreateBuilder(args);

// Services.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHealthChecks();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseHealthChecks("/health");

app.Run();
