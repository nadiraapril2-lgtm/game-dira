export const UNITY_CSHARP_SCRIPT = `// =========================================================================
// Network Architect: Data Center Tycoon - Unity C# ServerRack Simulation Logic
// Based on image_0.png Gameplay Mechanics (Fase 3: Overheat Crisis & Telemetry)
// =========================================================================

using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

[System.Serializable]
public class ServerBladeData
{
    public string bladeID;
    public float powerDrawWatts;      // e.g. 150W - 450W
    public float trafficLoadMBps;     // e.g. 50MB/s - 800MB/s
    public bool isThrottled;
    
    public ServerBladeData(string id, float power, float traffic)
    {
        this.bladeID = id;
        this.powerDrawWatts = power;
        this.trafficLoadMBps = traffic;
        this.isThrottled = false;
    }
}

public class ServerRack : MonoBehaviour
{
    [Header("Temperature & Environment")]
    [Tooltip("Current rack ambient temperature in Celsius")]
    [SerializeField] private float temperature = 26.0f;
    [SerializeField] private float ambientBaseTemp = 24.0f;
    [SerializeField] private float overheatThreshold = 75.0f;

    [Header("Cooling System")]
    [Tooltip("Cooling power provided by attached AC unit / fans (e.g. 40 to 180)")]
    [SerializeField] private float coolingPower = 50.0f;
    [SerializeField] private bool turboCoolingActive = false;

    [Header("Hardware Configuration")]
    [SerializeField] private int maxRackUnits = 42;
    [SerializeField] private List<ServerBladeData> serverBlades = new List<ServerBladeData>();

    [Header("Simulation Events")]
    public UnityEvent<float> OnTemperatureChanged;
    public UnityEvent<float> OnOverheatCrisisTriggered; // Fired when T > 75°C
    public UnityEvent OnCrisisResolved;

    private bool isCrisisFired = false;

    public float CurrentTemperature => temperature;
    public float CoolingPower => coolingPower;
    public int BladeCount => serverBlades.Count;
    public bool IsInOverheatCrisis => temperature >= overheatThreshold;

    private void Start()
    {
        // Example initialization of blades
        if (serverBlades.Count == 0)
        {
            serverBlades.Add(new ServerBladeData("BLADE-01", 150f, 45f));
            serverBlades.Add(new ServerBladeData("BLADE-02", 220f, 120f));
        }
    }

    private void Update()
    {
        SimulateThermalDynamics(Time.deltaTime);
    }

    private void SimulateThermalDynamics(float dt)
    {
        // 1. Calculate cumulative thermal output from all active ServerBlade children
        float totalHeatGeneration = 0f;
        foreach (var blade in serverBlades)
        {
            // Heat generated is a function of base electrical power draw + packet traffic load
            float trafficHeatFactor = 1.0f + (blade.trafficLoadMBps / 500f);
            totalHeatGeneration += (blade.powerDrawWatts * 0.08f) * trafficHeatFactor;
        }

        // 2. Factor in cooling capacity (boosted during turbo overdrive)
        float effectiveCooling = coolingPower * (turboCoolingActive ? 1.8f : 1.0f);

        // 3. Rate of temperature change towards thermal equilibrium
        // Delta = (Heat Generated - Cooling Power) scaled by time
        float netThermalFlow = (totalHeatGeneration - (effectiveCooling * 0.75f));
        
        // As rack heats up above ambient, natural dissipation also resists
        float ambientDissipation = (temperature - ambientBaseTemp) * 0.05f;
        float tempDelta = (netThermalFlow - ambientDissipation) * 0.08f * dt;

        temperature = Mathf.Clamp(temperature + tempDelta, ambientBaseTemp, 110.0f);

        // Notify UI listeners
        OnTemperatureChanged?.Invoke(temperature);

        // 4. Trigger Overheat Crisis Event (similar to Fase 3 in image_0.png)
        if (temperature >= overheatThreshold && !isCrisisFired)
        {
            isCrisisFired = true;
            Debug.LogWarning($"[CRISIS ALERT] ServerRack overheat! Temp: {temperature:F1}°C > {overheatThreshold}°C");
            OnOverheatCrisisTriggered?.Invoke(temperature);
        }
        else if (temperature < (overheatThreshold - 5.0f) && isCrisisFired)
        {
            // Hysteresis reset: crisis clears when cooled back down below 70°C
            isCrisisFired = false;
            Debug.Log($"[CRISIS RESOLVED] ServerRack stabilized at {temperature:F1}°C");
            OnCrisisResolved?.Invoke();
        }
    }

    // Interactive gameplay hooks called from player UI actions
    public void SetTurboCooling(bool active)
    {
        turboCoolingActive = active;
    }

    public void AddBlade(ServerBladeData blade)
    {
        serverBlades.Add(blade);
    }

    public void ApplyTrafficSpike(float targetMBps)
    {
        foreach (var blade in serverBlades)
        {
            blade.trafficLoadMBps = targetMBps / serverBlades.Count;
        }
    }
}
`;
