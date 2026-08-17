class DownloadsController < ApplicationController
  def church_programme_view
    show_programme(:church)
  end

  def reception_programme_view
    show_programme(:reception)
  end

  def church_programme
    download_programme(:church)
  end

  def reception_programme
    download_programme(:reception)
  end

  private

  def show_programme(programme)
    if (path = uploaded_programme_path(programme))
      send_file path, type: "application/pdf", disposition: "inline"
    elsif (url = external_programme_url(programme))
      redirect_to url, allow_other_host: true
    else
      send_data programme_pdf(programme_title(programme), programme_lines(programme)),
        filename: programme_filename(programme),
        type: "application/pdf",
        disposition: "inline"
    end
  end

  def download_programme(programme)
    if (path = uploaded_programme_path(programme))
      send_file path, type: "application/pdf", disposition: "attachment", filename: programme_filename(programme)
    elsif (url = external_programme_url(programme))
      redirect_to url, allow_other_host: true
    else
      send_data programme_pdf(programme_title(programme), programme_lines(programme)),
        filename: programme_filename(programme),
        type: "application/pdf",
        disposition: "attachment"
    end
  end

  def uploaded_programme_path(programme)
    source = programme_source(programme)
    if source.start_with?("/uploads/programmes/")
      path = Rails.public_path.join(source.delete_prefix("/"))
      return path if File.exist?(path)
    end

    latest_uploaded_programme_path(programme) if source.blank? || source.start_with?("/uploads/programmes/")
  end

  def latest_uploaded_programme_path(programme)
    pattern = Rails.public_path.join("uploads", "programmes", "#{programme}-programme-*.pdf").to_s
    path = Dir[pattern].max_by { |file| File.mtime(file) }
    return unless path

    source = "/uploads/programmes/#{File.basename(path)}"
    SiteSetting.current.update!(programme_setting_field(programme) => source)
    Pathname.new(path)
  end

  def external_programme_url(programme)
    source = programme_source(programme)
    source if source.match?(%r{\Ahttps?://}i)
  end

  def programme_source(programme)
    SiteSetting.current.public_send(programme_setting_field(programme)).to_s
  end

  def programme_setting_field(programme)
    programme == :church ? :church_programme_url : :reception_programme_url
  end

  def programme_title(programme)
    programme == :church ? "Church Programme" : "Reception Programme"
  end

  def programme_filename(programme)
    programme == :church ? "church-programme.pdf" : "reception-programme.pdf"
  end

  def programme_lines(programme)
    return [
      "Comfort & Shammah",
      "Saturday, October 17, 2026",
      "10:00 AM",
      "ECWA Headquarters Church, Jos",
      "Prayer",
      "Bible reading",
      "Vows",
      "Signing",
      "Blessing"
    ] if programme == :church

    [
      "Comfort & Shammah",
      "Saturday, October 17, 2026",
      "After the ceremony",
      "ECWA Headquarters International Conference Hall, Jos",
      "Arrival",
      "Couple entrance",
      "Speeches",
      "Cake cutting",
      "Dance"
    ]
  end

  def programme_pdf(title, lines)
    content_lines = []
    y = 760

    content_lines << "BT /F1 24 Tf 72 #{y} Td (#{escape_pdf(title)}) Tj ET"
    y -= 44

    lines.each do |line|
      content_lines << "BT /F1 12 Tf 72 #{y} Td (#{escape_pdf(line)}) Tj ET"
      y -= 24
    end

    content = content_lines.join("\n")

    objects = [
      "<< /Type /Catalog /Pages 2 0 R >>",
      "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
      "<< /Length #{content.bytesize} >>\nstream\n#{content}\nendstream"
    ]

    pdf = +"%PDF-1.4\n"
    offsets = []
    objects.each_with_index do |object, index|
      offsets << pdf.bytesize
      pdf << "#{index + 1} 0 obj\n#{object}\nendobj\n"
    end

    xref_start = pdf.bytesize
    pdf << "xref\n0 #{objects.length + 1}\n"
    pdf << "0000000000 65535 f \n"
    offsets.each do |offset|
      pdf << format("%010d 00000 n \n", offset)
    end
    pdf << "trailer\n<< /Size #{objects.length + 1} /Root 1 0 R >>\nstartxref\n#{xref_start}\n%%EOF\n"
    pdf
  end

  def escape_pdf(text)
    text.to_s.gsub("\\", "\\\\").gsub("(", "\\(").gsub(")", "\\)")
  end
end
