-- Migration 003: Add has_branches feature flag to gyms
alter table gyms add column has_branches boolean not null default false;
