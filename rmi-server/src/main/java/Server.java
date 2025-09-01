import org.example.shared.VotingService;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;

public class Server {
    public static void main(String[] args) {
        try {
            // Allow overriding RMI hostname for external clients
            String rmiHost = System.getenv().getOrDefault("RMI_HOST", System.getProperty("rmi.host","0.0.0.0"));
            System.setProperty("java.rmi.server.hostname", rmiHost);
            VotingService service = new VotingServiceImpl();
            Registry registry = LocateRegistry.createRegistry(1099); // Default RMI port
            registry.rebind("VotingService", service);
            System.out.println("✅ RMI Server is running on host: " + System.getProperty("java.rmi.server.hostname"));
        } catch (Exception e) {
            System.err.println("RMI Server exception: " + e.toString());
            e.printStackTrace();
        }
    }
}