package xyz.codeark.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;

/**
 * Holds details related to a repository.
 */
@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GitRepository extends Directory {

    @Override
    public String toString() {
        return "Directory{" +
                "path='" + path + '\'' +
                "name='" + name + '\'' +
                "status='" + status + '\'' +
                '}';
    }
}
