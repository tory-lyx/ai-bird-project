
using System.Text.Json.Serialization;

namespace CentralServer.Models;

public class AiResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("predictions")]
    public List<AiPrediction> Predictions { get; set; } = new();
}
