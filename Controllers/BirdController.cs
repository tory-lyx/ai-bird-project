using Microsoft.EntityFrameworkCore;
using CentralServer.Data;
using CentralServer.Models;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Json;
using System.Text.Json;

namespace CentralServer.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BirdController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly BirdDbContext _db;

    public BirdController(
        IHttpClientFactory httpClientFactory,
        BirdDbContext db)
    {
        _httpClientFactory = httpClientFactory;
        _db = db;
    }

    [HttpPost("analyze")]
    public async Task<IActionResult> Analyze(
        IFormFile file,
        CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Файл не завантажено.");

        var extension = Path.GetExtension(file.FileName).ToLower();

        if (extension != ".jpg" &&
            extension != ".jpeg" &&
            extension != ".png")
        {
            return BadRequest("Дозволені JPG, JPEG та PNG.");
        }

        if (file.Length > 10 * 1024 * 1024)
            return BadRequest("Максимальний розмір файлу — 10 МБ.");

        try
        {
            using var content = new MultipartFormDataContent();

            using var fileStream = file.OpenReadStream();

            using var fileContent = new StreamContent(fileStream);

            fileContent.Headers.ContentType =
                new System.Net.Http.Headers.MediaTypeHeaderValue(
                    file.ContentType == "image/png"
                        ? "image/png"
                        : "image/jpeg"
                );

            content.Add(fileContent, "file", file.FileName);

            var client = _httpClientFactory.CreateClient("AiServer");

            var response = await client.PostAsync(
                "/predict",
                content,
                cancellationToken
            );

            if (!response.IsSuccessStatusCode)
            {
                return StatusCode(502,
                    "Помилка під час звернення до AI Server.");
            }

            var aiResult = await response.Content
                .ReadFromJsonAsync<AiResponse>(
                    cancellationToken: cancellationToken
                );

            if (aiResult == null ||
                !aiResult.Success ||
                aiResult.Predictions.Count == 0)
            {
                return StatusCode(502, "AI Server не повернув результат.");
            }

            var best = aiResult.Predictions[0];

            var analysis = new BirdAnalysis
            {
                ImageName = Path.GetFileName(file.FileName),
                PredictedSpecies = best.Species,
                Confidence = best.Confidence,
                AnalysisDate = DateTime.UtcNow,
                Description = "Інформацію про птаха можна отримати окремо."
            };

            _db.BirdAnalyses.Add(analysis);
            await _db.SaveChangesAsync(cancellationToken);

            return Ok(new
            {
                success = true,
                id = analysis.Id,
                imageName = analysis.ImageName,
                predictions = aiResult.Predictions,
                analysisDate = analysis.AnalysisDate
            });
        }
        catch (HttpRequestException)
        {
            return StatusCode(503,
                "AI Server недоступний. Перевір, чи він запущений.");
        }
        catch (TaskCanceledException)
        {
            return StatusCode(504, "Час очікування відповіді вичерпано.");
        }
        catch (JsonException)
        {
            return StatusCode(502, "Некоректна відповідь від AI Server.");
        }
    }

    [HttpGet("history")]
    public async Task<IActionResult> History()
    {
        var results = await _db.BirdAnalyses
            .OrderByDescending(x => x.AnalysisDate)
            .ToListAsync();

        return Ok(results);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(
        int id,
        CancellationToken cancellationToken)
    {
        var analysis = await _db.BirdAnalyses
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken
            );

        if (analysis == null)
            return NotFound("Запис не знайдено.");

        _db.BirdAnalyses.Remove(analysis);

        await _db.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            success = true,
            message = "Запис успішно видалено."
        });
    }
}
