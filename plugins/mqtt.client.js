import mqtt from "mqtt";
import Swal from "sweetalert2";

export default defineNuxtPlugin(() => {
  const route = useRoute()
  const id = route.params.id
  const mqttBase = useRuntimeConfig().public.mqttBase
  const client = mqtt.connect(mqttBase, {
    username: "scentral",
    password: "ar0m4db",
    clientId: "browser-client-" + Math.random().toString(16).substr(2, 8)
  });

  // Store custom message handlers for different pages/components
  const customHandlers = new Map();
  
  // Default message handler
  const defaultMessageHandler = (topic, message) => {
    console.log('This is from mqtt message (default handler)');
    try {
      const data = JSON.parse(message.toString())
      console.log("this is data ", data);
      if (data.machine_code === id) {
        Swal.fire({
          title: "Advertising State",
          text: `State: ${data.machine_code}`,
          icon: "info",
        });
      }
    } catch (error) {
      console.log(error);
    }
    console.log(`[${topic}] ${message.toString()}`);
  };

  client.on("connect", () => {
    console.log("✅ Connected via WebSocket");
    client.subscribe("scentral/advertising/state");
    client.subscribe("scentral/ads/slot/assignment");
    client.subscribe("scentral/ads/balance/update");
  });

  // Main message handler that delegates to custom handlers or default
  client.on("message", (topic, message) => {
    try {
      const data = JSON.parse(message.toString());
      const customHandler = customHandlers.get(data.machine_code);
      if (customHandler) {
        customHandler(topic, message, data);
      } else {
        // Use default handler
        defaultMessageHandler(topic, message);
      }
    } catch (error) {
      console.log('Error parsing MQTT message:', error);
      // Still call default handler for non-JSON messages
      defaultMessageHandler(topic, message);
    }
  });

  // Enhanced MQTT client with custom handler support
  const enhancedClient = {
    ...client,
    // Method to register a custom message handler for a specific machine_code
    registerHandler: (machineCode, handler) => {
      console.log(`Registering custom MQTT handler for machine_code: ${machineCode}`);
      customHandlers.set(machineCode, handler);
    },
    // Method to unregister a custom message handler
    unregisterHandler: (machineCode) => {
      console.log(`Unregistering custom MQTT handler for machine_code: ${machineCode}`);
      customHandlers.delete(machineCode);
    },
    // Method to check if a handler is registered
    hasHandler: (machineCode) => {
      return customHandlers.has(machineCode);
    }
  };

  return {
    provide: {
      mqtt: enhancedClient,
    },
  };
});