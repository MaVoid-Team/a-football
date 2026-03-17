module Api
  module Admin
    class RatingsController < BaseController
      skip_after_action :verify_authorized
      skip_after_action :verify_policy_scoped

      def index
        courts_scope = if current_admin.super_admin?
          Court.all
        else
          Court.where(branch_id: current_admin.branch_id)
        end

        reviews_scope = if current_admin.super_admin?
          Review.all
        else
          Review.where(branch_id: current_admin.branch_id)
        end

        court_ids = courts_scope.pluck(:id)

        # Per-court aggregates
        aggregates = reviews_scope
          .where(court_id: court_ids)
          .group(:court_id)
          .select(
            :court_id,
            "COUNT(*) AS total_reviews",
            "ROUND(AVG(rating)::numeric, 2) AS avg_rating"
          )

        aggregate_map = aggregates.each_with_object({}) do |row, h|
          h[row.court_id] = {
            total_reviews: row.total_reviews.to_i,
            avg_rating:    row.avg_rating.to_f
          }
        end

        # Per-court rating distribution (1..5)
        distribution_rows = reviews_scope
          .where(court_id: court_ids)
          .group(:court_id, :rating)
          .count

        distribution_map = {}
        distribution_rows.each do |(court_id, rating), count|
          distribution_map[court_id] ||= { 1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0 }
          distribution_map[court_id][rating] = count
        end

        courts_data = courts_scope.includes(:branch).map do |court|
          agg  = aggregate_map[court.id]  || { total_reviews: 0, avg_rating: 0.0 }
          dist = distribution_map[court.id] || { 1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0 }

          {
            court_id:      court.id,
            court_name:    court.name,
            branch_id:     court.branch_id,
            branch_name:   court.branch&.name,
            avg_rating:    agg[:avg_rating],
            total_reviews: agg[:total_reviews],
            distribution:  dist
          }
        end

        # Overall totals
        total_reviews = aggregate_map.sum { |_, v| v[:total_reviews] }
        overall_avg   = if total_reviews > 0
          weighted = aggregate_map.sum { |_, v| v[:avg_rating] * v[:total_reviews] }
          (weighted / total_reviews).round(2)
        else
          0.0
        end

        render json: {
          overall_avg_rating: overall_avg,
          overall_total_reviews: total_reviews,
          courts: courts_data
        }, status: :ok
      end
    end
  end
end
