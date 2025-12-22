variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "repositories" {
  description = "List of repository names"
  type        = list(string)
}

variable "tags" {
  type    = map(string)
  default = {}
}
