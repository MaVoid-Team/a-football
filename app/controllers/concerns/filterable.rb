# frozen_string_literal: true

module Filterable
  extend ActiveSupport::Concern

  private

  def apply_sort(scope, allowed_columns, default = nil)
    sort_col = params[:sort].to_s
    return scope.reorder(default) if sort_col.blank? && default.present?
    return scope if sort_col.blank?

    col, dir = sort_col.split(".").map(&:presence)
    col = col.to_s.downcase
    dir = (dir.to_s.downcase == "desc") ? :desc : :asc

    return scope unless allowed_columns.key?(col)

    column = allowed_columns[col]
    scope.reorder(column => dir)
  end

  def apply_date_range(scope, column, from_param = :from_date, to_param = :to_date)
    from = params[from_param].presence
    to = params[to_param].presence

    scope = scope.where("#{column} >= ?", from) if from.present?
    if to.present?
      to_date = Date.parse(to) rescue nil
      scope = scope.where("#{column} <= ?", to_date&.end_of_day || to) if to_date
    end
    scope
  end

  def apply_numeric_range(scope, column, min_param = :min, max_param = :max)
    min = params[min_param].presence
    max = params[max_param].presence

    scope = scope.where("#{column} >= ?", min) if min.present?
    scope = scope.where("#{column} <= ?", max) if max.present?
    scope
  end

  def search_with_pagination(model, base_scope, filter_string = nil)
    return paginate(base_scope) if params[:q].blank?

    page = [params.fetch(:page, 1).to_i, 1].max
    per_page = [[params.fetch(:per_page, 25).to_i, 1].max, 100].min
    offset = (page - 1) * per_page

    begin
      search_opts = { limit: per_page, offset: offset }
      search_opts[:filter] = filter_string if filter_string.present?
      results = model.search(params[:q], search_opts)
      total = results.respond_to?(:estimated_total_hits) ? results.estimated_total_hits : results.size
      set_pagination_headers(total, page, per_page)
      results
    rescue StandardError => e
      Rails.logger.warn("Meilisearch search failed, falling back to scope: #{e.message}")
      paginate(base_scope)
    end
  end

  def set_pagination_headers(total, page, per_page)
    response.set_header("X-Total-Count", total.to_s)
    response.set_header("X-Page", page.to_s)
    response.set_header("X-Per-Page", per_page.to_s)
    response.set_header("X-Total-Pages", (total.to_f / per_page).ceil.to_s)
  end

  def build_meilisearch_filter(parts)
    return nil if parts.blank?
    parts.compact.join(" AND ")
  end
end
