package com.example.inventory.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Customer review submission for a product.")
public class ProductReviewRequest {

    @Min(value = 1, message = "Rating must be between 1 and 5.")
    @Max(value = 5, message = "Rating must be between 1 and 5.")
    @Schema(example = "5")
    private Integer rating;

    @Size(max = 120, message = "Review title must not exceed 120 characters.")
    @Schema(example = "Perfect for dry hair")
    private String title;

    @NotBlank(message = "Review comment is required.")
    @Size(max = 1000, message = "Review comment must not exceed 1000 characters.")
    @Schema(example = "Smells lovely and feels gentle enough for daily use.")
    private String comment;

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
