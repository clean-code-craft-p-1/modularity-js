import fs from 'fs'

function processBatch(filename) {
  let fileContent
  
  try {
    fileContent = fs.readFileSync(filename, 'utf8')
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('Error: File not found.')
      return
    }
    throw error
  }

  const lines = fileContent.split('\n')
  const temps = []
  const timestamps = []
  let errors = 0
  const badLines = []
  let num_blank_lines = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) {
      num_blank_lines++
      continue
    }
    
    const parts = line.split(',')
    if (parts.length !== 2) {
      errors++
      badLines.push({ index: i, line })
      continue
    }

    const timestamp = parts[0].trim()
    const value = parts[1].trim()

    // Validate timestamp
    if (timestamp.split(':').length !== 3) {
      errors++
      badLines.push({ index: i, line })
      continue
    }

    let temp
    try {
      temp = parseFloat(value)
      if (isNaN(temp)) {
        throw new Error('Invalid number')
      }
    } catch (error) {
      errors++
      badLines.push({ index: i, line })
      continue
    }

    // Drop impossible temperatures
    if (temp < -100 || temp > 200) {
      errors++
      badLines.push({ index: i, line })
      continue
    }

    temps.push(temp)
    timestamps.push(timestamp)
  }

  if (temps.length === 0) {
    console.log('No valid temperature data found.')
    return
  }

  // Calculate statistics
  const maxTemp = Math.max(...temps)
  const minTemp = Math.min(...temps)
  const avgTemp = temps.reduce((sum, temp) => sum + temp, 0) / temps.length

  // Print summary
  console.log('='.repeat(60))
  console.log('Temperature Analysis Summary')
  console.log('='.repeat(60))
  console.log(`Total readings: ${lines.length - num_blank_lines}`)
  console.log(`Valid readings: ${temps.length}`)
  console.log(`Errors: ${errors}`)
  console.log('-'.repeat(60))
  console.log(`Max temperature: ${maxTemp.toFixed(2)}`)
  console.log(`Min temperature: ${minTemp.toFixed(2)}`)
  console.log(`Average temperature: ${avgTemp.toFixed(2)}`)
  console.log('-'.repeat(60))

  // Print invalid lines (verbose)
  if (errors > 0) {
    console.log('Invalid lines:')
    for (const { index, line } of badLines) {
      console.log(`  Line ${index + 1}: ${line}`)
    }
  }

  // Save report
  const outName = filename + '_summary.txt'
  try {
    let reportContent = 'Temperature Analysis Summary\n'
    reportContent += '='.repeat(50) + '\n'
    reportContent += `File analyzed: ${filename}\n`
    reportContent += `Total readings: ${lines.length - num_blank_lines}\n`
    reportContent += `Valid readings: ${temps.length}\n`
    reportContent += `Errors: ${errors}\n`
    reportContent += `Max temperature: ${maxTemp.toFixed(2)}\n`
    reportContent += `Min temperature: ${minTemp.toFixed(2)}\n`
    reportContent += `Average temperature: ${avgTemp.toFixed(2)}\n`
    reportContent += '-'.repeat(60) + '\n'
    
    if (errors > 0) {
      reportContent += '\nInvalid lines:\n'
      for (const { index, line } of badLines) {
        reportContent += `  Line ${index + 1}: ${line}\n`
      }
    }
    
    fs.writeFileSync(outName, reportContent)
    console.log(`Report saved to ${outName}`)
  } catch (error) {
    console.log('Error saving file:', error.message)
  }
}

// Main execution
const testFilename = 'test_temps.csv'
const testData = [
'09:15:30,23.5',
'09:16:00,24.1',
'09:16:30,22.8',
'09:17:00,25.3',
'09:17:30,23.9',
'09:18:00,24.7',
'09:18:30,22.4',
'09:19:00,26.1',
'09:19:30,23.2',
'09:20:00,25.0'
]

fs.writeFileSync(testFilename, testData.join('\n') + '\n')
console.log(`Created test file: ${testFilename}`)

// Process the test file
processBatch(testFilename)

// Verify the summary file was created
const summaryFile = testFilename + '_summary.txt'
if (fs.existsSync(summaryFile)) {
    console.log(`\nSummary file created: ${summaryFile}`)
    const content = fs.readFileSync(summaryFile, 'utf8')

    // Verify content
    const checks = [
        'Total readings: 10',
        'Valid readings: 10',
        'Errors: 0'
    ]

    const allChecksPass = checks.every(check => content.includes(check))

    if (allChecksPass) {
        console.log('✓ Summary file contents verified')
    } else {
        console.log('✗ Summary file verification failed')
    }
}

// Clean up test files
if (fs.existsSync(testFilename)) {
    fs.unlinkSync(testFilename)
}
if (fs.existsSync(summaryFile)) {
    fs.unlinkSync(summaryFile)
}
