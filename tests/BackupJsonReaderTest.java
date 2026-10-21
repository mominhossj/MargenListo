import app.margenlisto.mobile.BackupJsonReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

public final class BackupJsonReaderTest {
  static int passed;
  static void expect(String input, int limit, String expected) throws Exception {
    String actual=BackupJsonReader.read(new ByteArrayInputStream(input.getBytes(StandardCharsets.UTF_8)),limit);
    if(!actual.equals(expected)) throw new AssertionError("Expected: "+expected+"; got: "+actual);
    passed++;
  }
  static void shouldFail(byte[] bytes, int limit) throws Exception {
    try { BackupJsonReader.read(new ByteArrayInputStream(bytes),limit);throw new AssertionError("Expected rejection"); }
    catch (IOException expected) { passed++; }
  }
  public static void main(String[] args) throws Exception {
    expect("{\"kind\":\"MargenListoLedger\"}",750000,"{\"kind\":\"MargenListoLedger\"}");
    expect("\uFEFF{\"x\":1}",500,"{\"x\":1}");
    expect("{\"producto\":\"Remera negra\"}",200,"{\"producto\":\"Remera negra\"}");
    expect("{\"ñ\":\"✓\"}",100,"{\"ñ\":\"✓\"}");
    expect("{}",2,"{}");
    shouldFail("{}".getBytes(StandardCharsets.UTF_8),1);
    shouldFail(new byte[0],100);
    shouldFail(new byte[]{(byte)0xC3,(byte)0x28},100);
    byte[] tooBig=new byte[750001]; Arrays.fill(tooBig,(byte)'a');shouldFail(tooBig,750000);
    try { BackupJsonReader.read(null,100); throw new AssertionError("Expected null refusal"); }
    catch(IOException expected){passed++;}
    System.out.println("Backup reader: " + passed + " checks OK");
  }
}
