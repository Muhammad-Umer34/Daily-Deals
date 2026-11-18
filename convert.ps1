try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $doc = $word.Documents.Open("E:\My Projects\Daily Deals\Project_Proposal.docx")
    $pdfPath = "E:\My Projects\Daily Deals\Project_Proposal.pdf"
    $doc.SaveAs([ref]$pdfPath, [ref]17)
    $doc.Close()
    $word.Quit()
    Write-Host "PDF_EXPORT_SUCCESS: $pdfPath"
} catch {
    Write-Host "PDF_EXPORT_ERROR: $($_.Exception.Message)"
}
