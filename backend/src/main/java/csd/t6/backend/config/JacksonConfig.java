package csd.t6.backend.config;

import java.io.IOException;

import org.jooq.JSONB;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;

@Configuration
public class JacksonConfig {

  @Bean
  @Primary
  public ObjectMapper objectMapper() {
    ObjectMapper mapper = new ObjectMapper();
    SimpleModule module = new SimpleModule();

    // Serializer for JSONB - converts JSONB to its underlying data
    module.addSerializer(JSONB.class, new StdSerializer<JSONB>(JSONB.class) {
      @Override
      public void serialize(JSONB value, com.fasterxml.jackson.core.JsonGenerator gen, SerializerProvider provider)
          throws IOException {
        if (value == null || value.data() == null) {
          gen.writeNull();
        } else {
          Object data = value.data();
          // Write the data directly (Map, List, String, etc.)
          gen.writeObject(data);
        }
      }
    });

    // Deserializer for JSONB
    module.addDeserializer(JSONB.class, new StdDeserializer<JSONB>(JSONB.class) {
      @Override
      public JSONB deserialize(com.fasterxml.jackson.core.JsonParser p, DeserializationContext ctxt)
          throws IOException {
        JsonNode node = p.getCodec().readTree(p);
        return JSONB.valueOf(node.toString());
      }
    });

    mapper.registerModule(module);
    return mapper;
  }
}
