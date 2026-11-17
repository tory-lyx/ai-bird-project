
using System.Text.Json.Serialization;

namespace CentralServer.Models;

public class AiPrediction
{
    [JsonPropertyName("species")]
    public string Species { get; set; } = "";

    [JsonPropertyName("confidence")]
    public double Confidence { get; set; }
}
