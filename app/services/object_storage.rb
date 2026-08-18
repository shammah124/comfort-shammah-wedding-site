require "aws-sdk-s3"
require "stringio"

class ObjectStorage
  CACHE_CONTROL = "public, max-age=31536000, immutable".freeze

  class << self
    def configured?
      ENV.values_at("R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET", "R2_ENDPOINT", "R2_PUBLIC_BASE_URL").all?(&:present?)
    end

    def upload(key, file, content_type:)
      raise "Cloudflare R2 is not configured." unless configured?

      io = file.respond_to?(:tempfile) ? file.tempfile : file
      io.rewind if io.respond_to?(:rewind)
      client.put_object(
        bucket: ENV.fetch("R2_BUCKET"),
        key: key,
        body: io,
        content_type: content_type.presence || "application/octet-stream",
        cache_control: CACHE_CONTROL
      )
      "#{public_base_url}/#{key}"
    end

    def delete(url)
      return unless manages?(url)

      client.delete_object(bucket: ENV.fetch("R2_BUCKET"), key: url.delete_prefix("#{public_base_url}/"))
    end

    def download(url)
      raise "This file is not stored in Cloudflare R2." unless manages?(url)

      response = client.get_object(bucket: ENV.fetch("R2_BUCKET"), key: url.delete_prefix("#{public_base_url}/"))
      response.body.read
    end

    def manages?(url)
      configured? && url.to_s.start_with?(public_base_url)
    end

    private

    def client
      @client ||= Aws::S3::Client.new(
        access_key_id: ENV.fetch("R2_ACCESS_KEY_ID"),
        secret_access_key: ENV.fetch("R2_SECRET_ACCESS_KEY"),
        region: "auto",
        endpoint: ENV.fetch("R2_ENDPOINT"),
        force_path_style: true
      )
    end

    def public_base_url
      ENV.fetch("R2_PUBLIC_BASE_URL").sub(%r{/\z}, "")
    end
  end
end
