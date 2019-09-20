const fs = require("fs");
const jsonfile = require('jsonfile');
const jsonld = require('jsonld');
const ldParser = require('./linkeddataparser2');
const camelCase = require('camelcase');
const papaparse = require('papaparse');

 
var program = require('commander');
 
program
  .version('0.8.0')
  .usage('node csv-renderer.js renders the content of a CSV file into a jsonld template')
  .option('-t, --template <template>', 'jsonld template to render')
  .option('-h, --contextbase <hostname>', 'the public base url on which the context of the jsons are published.')
  .option('-r, --documentpath <path>', 'the document path on which the jsons are is published')
  .option('-x, --debug <path>', 'dump the intermediate json which will be used by the templaterenderer')
  .option('-i, --input <path>', 'input file (a csv file)')
  .option('-o, --output <path>', 'output file (a json file)')

program.on('--help', function(){
  console.log('')
  console.log('Examples:');
  console.log('  $ csv-renderer --help');
  console.log('  $ csv-renderer -i <input> -o <output>');
});

program.parse(process.argv);

var output = program.output || 'output.json';
var csvoptions = {
	header: true,
	skipEmptyLines: true,
	complete: function(results) {
		console.log("Finished:");
	}
	}


render_csv(program.template, program.input, output);
console.log('done');



function render_csv(templatefile, csvfilename, output) {
  console.log('start reading');
  var template = fs.readFileSync(templatefile, 'utf-8');
  var csvf = fs.readFileSync(csvfilename, 'utf-8');
  var csv = papaparse.parse(csvf, csvoptions);

  var pt = parse_template(template);
//  var ren = render_template(pt, {'ID':'een identifier', 'STRING' : 'een string waarde', 'BOOLEAN': 'true', 'VAL' : 'I do not know'});
  var ren = render_template(pt, csv.data);
  console.log(ren);

  jsonfile.writeFile(output, ren, function (err) {
		if (err) {
		   // Set the exit code if there's a problem so bash sees it
		   process.exitCode = 1;
                   console.error(err);
                   throw err;
                   }
		});
  console.log('finished rendering to ' + output);
};



	


function parse_template(file) {
	var parsed_template = {
		pt_full: [],
		pt_vars :[]
	};
	
	var file1 = file.split('{{');
	var file2 = [];
	for (i in file1) {
	   file2 = file2.concat(file1[i].split('}}'));
	};
	parsed_template.pt_full = file2;
	
	return parsed_template
}

function render_template(parsed_template, data){
	var renderedData = [];
	for (i in data) {
	  renderedData[i] = render_template_single(parsed_template,data[i]);
	}
	return renderedData;
};

function render_template_single(parsed_template, data){
	let render = '';
	for (i in parsed_template.pt_full) {
	  let reminder = i % 2;
	  if (reminder == 0) {
		render = render + parsed_template.pt_full[i];
	  } else {
		render = render + data[parsed_template.pt_full[i]];
	  }
	}
	return render;
}