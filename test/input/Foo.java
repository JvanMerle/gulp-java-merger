import java.io.File;

// One line comment
public class Foo {
    public String name = "Foo";
    
    public static void main(String[] args) {
        Bar b = new Bar();
        b.printName();
    }
    
    public void printName() {
        System.out.println(this.name);
    }
}