require 'net/http'
require 'json'

# 👉 Função que envia o prompt para o Ollama local
def ask_codestral(prompt)
  uri = URI("http://localhost:11434/api/generate")

  body = {
    model: "codestral",
    prompt: prompt,
    stream: false
  }

  headers = {
    'Content-Type' => 'application/json'
  }

  res = Net::HTTP.post(uri, body.to_json, headers)

  if res.is_a?(Net::HTTPSuccess)
    response = JSON.parse(res.body)
    puts "\n🧠 Resposta da IA:\n\n#{response["response"]}"
  else
    puts "❌ Erro ao chamar o modelo Codestral:"
    puts res.body
  end
end

# 👉 Captura input via terminal
if ARGV.empty?
  puts "❗Uso: ruby neomcp.rb \"Seu prompt aqui\""
  exit
end

user_input = ARGV.join(" ")

puts "\n💬 Enviando para Codestral: \"#{user_input}\"..."
ask_codestral(user_input)
